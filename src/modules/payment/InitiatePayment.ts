import { randomUUID } from "crypto";
import { IRequestUser } from "../users/user.interface";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import axios from "axios";
import { PaymentType } from "../../../generated/prisma/enums";

const generateTransactionId = (): string => {
  return `LMS-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
};

export const InitiatePayment = async (
  user: IRequestUser,
  bookingId: string,
  clientUrl?: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true },
  });

  if (!booking) {
    throw new Error("Booking Not Found");
  }

  // fine আছে কিনা তার উপর ভিত্তি করে amount আর type ঠিক করা
  const isFine = booking.fineAmount > 0;
  const totalAmount = isFine ? booking.fineAmount : booking.rentFee;
  const paymentType: PaymentType = isFine ? "FINE" : "RENT";

  // এই booking এর জন্য, এই নির্দিষ্ট type এর payment আগে থেকে আছে কিনা check
  const existingPayment = await prisma.payment.findFirst({
    where: {
      bookingId,
      type: paymentType,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existingPayment?.status === "PAID") {
    throw new Error(`You have already paid the ${paymentType.toLowerCase()}`);
  }

  const tranId = generateTransactionId();

  // If client is running locally (e.g. localhost:3000), backend callback must also be local (localhost:5000)
  const isLocalClient =
    clientUrl && (clientUrl.includes("localhost") || clientUrl.includes("127.0.0.1"));
  const backendBase = isLocalClient
    ? `http://localhost:${config.port || 5000}`
    : config.local_app_url?.replace(/\/$/, "") || `http://localhost:${config.port || 5000}`;

  const clientParam = clientUrl ? `&clientUrl=${encodeURIComponent(clientUrl)}` : "";

  const paymentPayload = {
    store_id: config.store_id,
    store_passwd: config.store_passwd,
    total_amount: totalAmount,
    currency: "BDT",
    tran_id: tranId,
    success_url: `${backendBase}/payment?bookingId=${bookingId}&tranId=${tranId}&status=success${clientParam}`,
    fail_url: `${backendBase}/payment?bookingId=${bookingId}&tranId=${tranId}&status=fail${clientParam}`,
    cancel_url: `${backendBase}/payment?bookingId=${bookingId}&tranId=${tranId}&status=cancel${clientParam}`,
    cus_name: user?.name,
    cus_email: booking.user.email,
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    value_a: bookingId,
    value_b: clientUrl || "",
    value_c: tranId,
    value_d: user?.id || "",
  };

  const response = await axios.post(
    "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
    paymentPayload,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const data = response.data;
  const sessionUrl = data.GatewayPageURL;

  // আগের attempt PENDING/FAILED অবস্থায় থাকলে সেই record-ই update করবো (নতুন row বানাবো না)
  if (existingPayment) {
    const updatedPayment = await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        transactionId: tranId,
        status: "PENDING",
        amount: totalAmount,
      },
    });

    return { sessionUrl, payment: updatedPayment };
  }


  // কোনো আগের attempt নাই, নতুন payment তৈরি
  const createPayment = await prisma.payment.create({
    data: {
      bookingId,
      userId: user.id,
      amount: totalAmount,
      type: paymentType,
      transactionId: tranId,
    },
  });

  return { sessionUrl, payment: createPayment };
};
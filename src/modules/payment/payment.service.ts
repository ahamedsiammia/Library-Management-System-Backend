import axios from "axios";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../users/user.interface";
import { InitiatePayment } from "./InitiatePayment";

const createPayment = async (
  user: IRequestUser,
  bookingId: string,
  clientUrl?: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      payments: true,
    },
  });

  if (!booking) {
    throw new Error("Booking Not Found");
  }

  if (booking.userId !== user.id) {
    throw new Error("This booking owner is't you");
  }

  if (booking.status !== "APPROVED") {
    throw new Error("Your Booking Not APPROVED");
  }

  const checkout = await InitiatePayment(user, bookingId, clientUrl);

  return checkout;
};

// const verifyPayment = async (
//   bookingId: string,
//   tranId: string,
//   status: string,
//   payload: any,
// ) => {
//   const valId = payload.val_id;
//   const storeId = config.store_id;
//   const storePassword = config.store_passwd;

//   const response = await axios.post(
//     `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`,
//     {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     },
//   );



//   const paymentType = await prisma.payment.findUnique({
//     where : {
//       bookingId : bookingId,
//       transactionId : tranId
//     }
//   });

//   if(!paymentType){
//     throw new Error("Payment not found")
//   }

//   if (response.data.status === "VALID") {
//     const bookingDate = new Date();
//     const dueDate = new Date(bookingDate);
//     dueDate.setDate(dueDate.getDate() + 7); // bookingDate + 7 din  


//       let UpdateData = {};
//   if(paymentType?.type ==="FINE"){
//      UpdateData ={
//       status : "RETURNED",
//       finePaid : true
//     }
//   }else if(paymentType?.type === "RENT"){
//          UpdateData = {
//         status: "ISSUED",
//         bookingDate: bookingDate,
//         dueDate: dueDate,
//         isPaid: true,
//         finePaid : false
//       }
//   }


//    const booking = await prisma.booking.update({
//       where: {
//         id: bookingId,
//       },
//       data: UpdateData ,
//       include:{
//         book : true
//       }
//     });

//     await prisma.books.update({
//         where : {
//             id : booking?.book?.id
//         },
//         data : {
//             totalCopies : Number(booking?.book?.totalCopies) - 1
//         }
//     })

//     await prisma.payment.update({
//       where: {
//         bookingId,
//       },
//       data: {
//         status: "PAID",
//         method: response.data.card_issuer,
//         paidAt: new Date(),
//       },
//     });
//   } else if (response.data.status === "FAILED") {
//     await prisma.booking.update({
//       where: {
//         id: bookingId,
//       },
//       data: {
//         status: "REJECTED",
//       },
//     });

//     await prisma.payment.update({
//       where: {
//         bookingId,
//         transactionId: tranId,
//       },
//       data: {
//         status: "FAILED",
//         provider: response.data.card_issuer,
//         paidAt: new Date(),
//         meta: payload,
//       },
//     });
//   }

//   return status;
// };


const verifyPayment = async (
  bookingId: string,
  tranId: string,
  status: string,
  payload: any,
) => {
  const normStatus = (status || payload?.status || "").toLowerCase();

  const effectiveTranId =
    tranId || payload?.tran_id || payload?.tranId || payload?.value_c;
  const effectiveBookingId =
    bookingId || payload?.value_a || payload?.bookingId;

  // Find existing payment by transactionId or bookingId
  let existingPayment = null;
  if (effectiveTranId) {
    existingPayment = await prisma.payment.findUnique({
      where: { transactionId: effectiveTranId },
    });
  }
  if (!existingPayment && effectiveBookingId) {
    existingPayment = await prisma.payment.findFirst({
      where: { bookingId: effectiveBookingId },
      orderBy: { createdAt: "desc" },
    });
  }

  // If user cancelled
  if (normStatus === "cancel" || normStatus === "cancelled") {
    if (existingPayment && existingPayment.status !== "PAID") {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: "FAILED" },
      });
    }
    return "cancel";
  }

  // If user failed
  if (normStatus === "fail" || normStatus === "failed") {
    if (existingPayment && existingPayment.status !== "PAID") {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: "FAILED" },
      });
    }
    return "fail";
  }

  if (!existingPayment) {
    throw new Error("Payment record not found");
  }

  // Already processed as PAID
  if (existingPayment.status === "PAID") {
    return "success";
  }

  // Validate with SSLCommerz
  const valId = payload?.val_id || payload?.valId;
  const storeId = config.store_id;
  const storePassword = config.store_passwd;

  let isValidated = false;
  let cardIssuer = payload?.card_issuer || payload?.card_type || "SSLCommerz";

  if (valId) {
    try {
      const response = await axios.get(
        `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`
      );
      if (
        response.data?.status === "VALID" ||
        response.data?.status === "VALIDATED"
      ) {
        isValidated = true;
        cardIssuer =
          response.data.card_issuer ||
          response.data.card_type ||
          cardIssuer;
      }
    } catch (err: any) {
      console.warn("SSLCommerz validator API warning:", err?.message);
    }
  }

  // Fallback: If SSLCommerz sent status: "VALID" directly in POST body
  if (
    !isValidated &&
    (payload?.status === "VALID" || payload?.status === "VALIDATED")
  ) {
    isValidated = true;
  }

  if (isValidated) {
    let bookingUpdateData: any = {};

    if (existingPayment.type === "RENT") {
      const bookingDate = new Date();
      const dueDate = new Date(bookingDate);
      dueDate.setDate(dueDate.getDate() + 14);

      bookingUpdateData = {
        status: "ISSUED",
        bookingDate,
        dueDate,
        isPaid: true,
        finePaid: false,
      };
    } else if (existingPayment.type === "FINE") {
      bookingUpdateData = {
        status: "RETURNED",
        returnDate: new Date(),
        finePaid: true,
      };
    }

    const booking = await prisma.booking.update({
      where: { id: effectiveBookingId || existingPayment.bookingId },
      data: bookingUpdateData,
      include: { book: true },
    });

    if (booking?.book?.id) {
      await prisma.books.update({
        where: { id: booking.book.id },
        data: {
          copiesAvailable:
            existingPayment.type === "RENT"
              ? Math.max(0, booking.book.copiesAvailable - 1)
              : booking.book.copiesAvailable + 1,
        },
      });
    }

    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: "PAID",
        method: cardIssuer,
        paidAt: new Date(),
      },
    });

    return "success";
  } else {
    await prisma.booking.update({
      where: { id: effectiveBookingId || existingPayment.bookingId },
      data: { status: "REJECTED" },
    });

    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: "FAILED",
        method: cardIssuer,
        paidAt: new Date(),
      },
    });

    return "fail";
  }
};

const allPayments = async () => {
  const payments = await prisma.payment.findMany();

  if (!payments) {
    throw new Error("Payment Not Found");
  }

  return payments;
};

const MyPayments = async (userId: string) => {
  console.log("Received userId:", userId);
  const myPayments = await prisma.payment.findMany({
    where: {
      userId : userId
    },
  });

  if (!myPayments) {
    throw new Error("Payment Not Found");
  }

  return myPayments;
};

const paymentDetails = async (userId: string, paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      user: {
        omit : {
          password : true
        }
      },
      booking: true,
    },
  });

  if (!payment) {
    throw new Error("Payment Not Found");
  }

  if (payment.user.role === "ADMIN" || payment.user.role === "LIBRARIAN") {
    return payment;
  }

  if (payment.user.id !== userId) {
    throw new Error("You Don't Owner this payment");
  }

  return payment;
};

export const paymentService = {
  createPayment,
  verifyPayment,
  allPayments,
  MyPayments,
  paymentDetails,
};

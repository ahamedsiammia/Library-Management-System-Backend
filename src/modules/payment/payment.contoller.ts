import { Request, Response } from "express";
import { paymentService } from "./payment.service";
import { IRequestUser } from "../users/user.interface";
import { sendResponse } from "../../utils/sendResponse";
import config from "../../config";
import { transporter } from "../../lib/nodemailer";
import { prisma } from "../../lib/prisma";

const createPayment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { bookingId } = req.body;
    console.log(bookingId);
    const { sessionUrl, payment } = await paymentService.createPayment(
      user as IRequestUser,
      bookingId,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Your Payment Create successfully",
      data: {
        sessionUrl,
        paymentData: payment,
      },
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
      error: error,
    });
  }
};

const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { bookingId, tranId, status } = req.query;
    const payload = req.body;

    // console.log("form verify payment ",req.body,bookingId,tranId,status);

    const response = await paymentService.verifyPayment(
      bookingId as string,
      tranId as string,
      status as string,
      payload,
    );
    console.log(response, "this is payment response");
    if (response === "success") {
      const payment = await prisma.payment.findUnique({
        where: {
          transactionId: tranId as string,
        },
        include: {
          user: true,
        },
      });

      if (!payment) {
        throw new Error("Payment not Found");
      }

      await transporter.sendMail({
        from:config.email_sender,
        to: payment?.user?.email,
        subject: "Payment Successful - Library Management System",
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Successful</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f1f5f9;
  font-family: Arial, Helvetica, sans-serif;
  color: #0f172a;
">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color: #f1f5f9; padding: 35px 15px;">

    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="
            max-width: 620px;
            background-color: #ffffff;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
          ">

          <!-- Header -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #00bba6, #0f766e);
              padding: 38px 30px;
              text-align: center;
            ">

              <div style="
                width: 65px;
                height: 65px;
                line-height: 65px;
                margin: 0 auto 18px;
                background-color: rgba(255,255,255,0.18);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                font-size: 30px;
                color: #ffffff;
              ">
                ✓
              </div>

              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 25px;
                font-weight: 700;
              ">
                Payment Successful
              </h1>

              <p style="
                margin: 10px 0 0;
                color: #dffcf8;
                font-size: 14px;
              ">
                Your payment has been successfully received.
              </p>

            </td>
          </tr>


          <!-- Content -->
          <tr>
            <td style="padding: 35px 30px;">

              <p style="
                margin: 0 0 8px;
                font-size: 16px;
                color: #334155;
              ">
                Hello <strong>${payment?.user?.name}</strong>,
              </p>

              <p style="
                margin: 0 0 25px;
                font-size: 14px;
                line-height: 1.7;
                color: #64748b;
              ">
                Thank you for using our Library Management System.
                Your payment has been completed successfully.
              </p>


              <!-- Success Message -->
              <div style="
                background-color: #f0fdfa;
                border: 1px solid #ccfbf1;
                border-radius: 12px;
                padding: 16px 18px;
                margin-bottom: 25px;
              ">

                <p style="
                  margin: 0;
                  color: #0f766e;
                  font-size: 14px;
                  font-weight: 600;
                ">
                  Payment Completed Successfully
                </p>

                <p style="
                  margin: 6px 0 0;
                  color: #64748b;
                  font-size: 13px;
                  line-height: 1.6;
                ">
                  Your payment has been recorded in our system.
                  Please keep this email for your future reference.
                </p>

              </div>


              <!-- Payment Details -->
              <h3 style="
                margin: 0 0 15px;
                font-size: 16px;
                color: #0f172a;
              ">
                Payment Details
              </h3>

              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                  overflow: hidden;
                ">

                <tr>
                  <td style="
                    padding: 13px 15px;
                    background-color: #f8fafc;
                    color: #64748b;
                    font-size: 13px;
                    border-bottom: 1px solid #e2e8f0;
                  ">
                    Transaction ID
                  </td>

                  <td style="
                    padding: 13px 15px;
                    background-color: #f8fafc;
                    color: #0f172a;
                    font-size: 13px;
                    font-weight: 700;
                    text-align: right;
                    border-bottom: 1px solid #e2e8f0;
                  ">
                    ${payment?.transactionId}
                  </td>
                </tr>


                <tr>
                  <td style="
                    padding: 13px 15px;
                    color: #64748b;
                    font-size: 13px;
                    border-bottom: 1px solid #e2e8f0;
                  ">
                    Amount
                  </td>

                  <td style="
                    padding: 13px 15px;
                    color: #0f766e;
                    font-size: 15px;
                    font-weight: 700;
                    text-align: right;
                    border-bottom: 1px solid #e2e8f0;
                  ">
                    ৳${payment?.amount}
                  </td>
                </tr>


                <tr>
                  <td style="
                    padding: 13px 15px;
                    color: #64748b;
                    font-size: 13px;
                    border-bottom: 1px solid #e2e8f0;
                  ">
                    Payment Method
                  </td>

                  <td style="
                    padding: 13px 15px;
                    color: #0f172a;
                    font-size: 13px;
                    font-weight: 600;
                    text-align: right;
                    border-bottom: 1px solid #e2e8f0;
                  ">
                    ${payment?.method}
                  </td>
                </tr>


                <tr>
                  <td style="
                    padding: 13px 15px;
                    color: #64748b;
                    font-size: 13px;
                  ">
                    Payment Date
                  </td>

                  <td style="
                    padding: 13px 15px;
                    color: #0f172a;
                    font-size: 13px;
                    font-weight: 600;
                    text-align: right;
                  ">
                    ${payment?.createdAt}
                  </td>
                </tr>

              </table>


              <!-- Bengali Message -->
              <div style="
                margin-top: 25px;
                padding: 17px;
                background-color: #f8fafc;
                border-radius: 12px;
                border-left: 4px solid #00bba6;
              ">

                <p style="
                  margin: 0;
                  color: #334155;
                  font-size: 13px;
                  line-height: 1.8;
                ">
                  আপনার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে।
                  এই ইমেইলটি আপনার পেমেন্টের রসিদ হিসেবে সংরক্ষণ করতে পারেন।
                </p>

              </div>


              <!-- CTA -->
              <div style="
                text-align: center;
                margin-top: 30px;
              ">

                <a
                  href="${"making loading..."}/dashboard/payments"
                  style="
                    display: inline-block;
                    padding: 13px 25px;
                    background-color: #00bba6;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 700;
                  "
                >
                  View Payment Details
                </a>

              </div>

            </td>
          </tr>


          <!-- Footer -->
          <tr>
            <td style="
              background-color: #f8fafc;
              padding: 25px 30px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            ">

              <p style="
                margin: 0 0 7px;
                color: #0f766e;
                font-size: 15px;
                font-weight: 700;
              ">
                Library Management System
              </p>

              <p style="
                margin: 0;
                color: #94a3b8;
                font-size: 12px;
                line-height: 1.6;
              ">
                Thank you for using our library services.
                <br />
                This is an automated email. Please do not reply.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>

  </table>

</body>
</html>
  `,
      });

      return res.redirect(`https://siamahamed.netlify.app`);
    } else if (response === "fail") {
      return res.redirect(
        "https://www.memberstack.com/webflow/failed-payment-page?utm_source=Pinterest&utm_medium=organic",
      );
    } else if (response === "cancel") res.redirect("/payment/cancel");
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
      data: [],
      error: { error },
    });
  }
};

const allPayments = async (req: Request, res: Response) => {
  try {
    const payments = await paymentService.allPayments();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Payment Retrieved Successfully",
      data: payments,
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
      error: error,
    });
  }
};

const MyPayments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const payments = await paymentService.MyPayments(userId as string);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Payment Retrieved Successfully",
      data: payments,
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
      error: error,
    });
  }
};

const paymentDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { paymentId } = req.params;
    const payments = await paymentService.paymentDetails(
      userId as string,
      paymentId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Payment Retrieved Successfully",
      data: payments,
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
      error: error,
    });
  }
};

export const paymentController = {
  createPayment,
  verifyPayment,
  allPayments,
  MyPayments,
  paymentDetails,
};

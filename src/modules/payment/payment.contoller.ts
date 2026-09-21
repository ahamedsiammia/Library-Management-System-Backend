import { Request, Response } from "express";
import { paymentService } from "./payment.service";
import { IRequestUser } from "../users/user.interface";
import { sendResponse } from "../../utils/sendResponse";
import config from "../../config";

const createPayment = async(req:Request,res:Response)=>{
    const user = req.user;
    const {bookingId} = req.body
    console.log(bookingId);
    const {sessionUrl,payment} = await paymentService.createPayment(user as IRequestUser,bookingId)

        sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Your Payment Create successfully",
      data : {
        sessionUrl,
        paymentData : payment
      },
    });
};


const verifyPayment =async(req:Request,res:Response)=>{
    try {

        const {bookingId,tranId,status}=req.query;
        const payload = req.body;

        // console.log("form verify payment ",req.body,bookingId,tranId,status);

        const response = await paymentService.verifyPayment(bookingId as string,tranId as string,status as string,payload)
console.log(response,"this is payment response");
        if(response === "success"){
            return res.redirect(`https://siamahamed.netlify.app`)
        }else if(response === "fail"){
            return res.redirect("https://www.memberstack.com/webflow/failed-payment-page?utm_source=Pinterest&utm_medium=organic")
        }else if(response === "cancel") res.redirect("/payment/cancel")
     

    } catch (error : any) {
        sendResponse(res,{
            success : false,
            statusCode : 500,
            message : error.message,
            data : [],
            error : {error}
        })
    }
}


export const paymentController ={
    createPayment,
    verifyPayment
}
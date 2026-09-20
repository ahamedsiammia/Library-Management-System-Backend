import { randomUUID } from "crypto";
import { IRequestUser } from "../users/user.interface";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import axios from "axios";
import { string } from "zod";
import { PaymentType } from "../../../generated/prisma/enums";

export const InitiatePayment =async(user:IRequestUser,bookingId:string)=>{


const generateTransactionId = (): string => {
  return `LMS-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
};


    const booking = await prisma.booking.findUnique({
        where : {
            id : bookingId
        },
        include:{
            user: true
        }
    });

    if(!booking){
        throw new Error("Booking Not Found")
    };

let totalAmount = booking.rentFee;

if (booking.fineAmount) {
  totalAmount = booking.rentFee + booking.fineAmount;
}

const tranId = generateTransactionId();

    const paymentPayload ={
        store_id:config.store_id,
        store_passwd:config.store_passwd,
        total_amount: totalAmount,
        currency:"BDT",
        tran_id:tranId,
        success_url:`${config.local_app_url}/payment/success?bookingId=${bookingId}&tranId=${tranId}`,
        fail_url:`${config.local_app_url}/payment/fail`,
        cancel_url:`${config.local_app_url}/payment/cancel`,
        cus_name:user?.name,
        cus_email:booking.user.email,
        cus_postcode:"1000",
        cus_country:"Bangladesh",
        
        
    }

    const response = await axios.post("https://sandbox.sslcommerz.com/gwprocess/v4/api.php",paymentPayload,{
        headers :{
            "Content-Type":"application/x-www-form-urlencoded"
        }
    })

    const data = await response.data

    const paymentType = totalAmount > 10 ? "FINE" : "RENT"

    const paymentData = {
        bookingId,
        userId : user.id,
        amount : totalAmount,
        type : paymentType as PaymentType,
        transactionId : paymentPayload.tran_id
    };


    const checkExistPayment = await prisma.payment.findUnique({
            where:{
                bookingId : bookingId
            }
        })

    
        const sessionUrl  = data.GatewayPageURL;

    if(checkExistPayment?.status === "PAID"){
        throw new Error("You are already PAID")
    }

    if(checkExistPayment){
        return {sessionUrl}
    }


    const createPayment = await prisma.payment.create({
        data : paymentData
    });

    return {sessionUrl,createPayment};
}

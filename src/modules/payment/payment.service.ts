import axios from "axios";
import config from "../../config";
import { prisma } from "../../lib/prisma"
import { IRequestUser } from "../users/user.interface"
import { InitiatePayment } from "./InitiatePayment";


const createPayment = async(user:IRequestUser,bookingId:string)=>{
    const booking = await prisma.booking.findUnique({
        where : {
            id : bookingId
        },
        include : {
            payments : true
        }
    });

    if(!booking){
        throw new Error("Booking Not Found")
    };

    if(booking.userId !== user.id){
        throw new Error("This booking owner is't you")
    };

    if(booking.status !== "APPROVED"){
        throw new Error("Your Booking Not APPROVED")
    };

    const checkout = await InitiatePayment(user,bookingId);

    return checkout
    
}


const verifyPayment =async(bookingId : string,tranId: string,status:string,payload:any)=>{

    const valId = payload.val_id;
    const storeId = config.store_id;
    const storePassword = config.store_passwd

    const response = await axios.post(`https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`,{
        headers : {
            "Content-Type" : "application/x-www-form-urlencoded"
        }
    })

console.log(response);
    if(response.data.status === "VALID"){
         const bookingDate = new Date();
  const dueDate = new Date(bookingDate);
  dueDate.setDate(dueDate.getDate() + 7); // bookingDate + 7 din

  await prisma.booking.update({
    where: {
      id: bookingId
    },
    data: {
      status: "ISSUED",
      bookingDate: bookingDate,
      dueDate: dueDate,
      isPaid : true
    }
  });

    await prisma.payment.update({
        where : {
            bookingId
        },
        data : {
            status : "PAID",
            method : response.data.card_issuer,
            paidAt : new Date()
        }
    })
    }else if(response.data.status === "FAILED"){
                await prisma.booking.update({
        where : {
            id : bookingId
        },
        data :{
            status : "REJECTED"
        }
    })

    await prisma.payment.update({
        where : {
            bookingId,
            transactionId : tranId
        },
        data : {
            status : "FAILED",
            provider : response.data.card_issuer,
            paidAt : new Date(),
            meta : payload 
        }
    })
    }

    return status
}


const allPayments = async()=>{
    const payments = await prisma.payment.findMany();
    
    if(!payments){
        throw new Error("Payment Not Found");
    }

    return payments
}

const MyPayments = async(userId : string)=>{
    const myPayments = await prisma.payment.findMany({
        where : {
            userId : userId
        }
    });

    if(!myPayments){
        throw new Error("Payment Not Found")
    };

    return myPayments
}

const paymentDetails = async(userId:string,paymentId:string)=>{
    const payment = await prisma.payment.findUnique({
        where : {
            id : paymentId
        },
        include : {
            user : true,
            booking : true
        }
    });

    if(!payment){
        throw new Error("Payment Not Found")
    };

    if(payment.user.role === "ADMIN" || payment.user.role === "LIBRARIAN"){
        return payment
    }

    if(payment.user.id !== userId){
        throw new Error("You Don't Owner this payment")
    }

    return payment
}

export const paymentService ={
    createPayment,
    verifyPayment,
    allPayments,
    MyPayments,
    paymentDetails
}
import { Request, Response } from "express";
import { bookingService } from "./booking.service";
import { ICreateBooking } from "./booking.interface";
import { sendResponse } from "../../utils/sendResponse";
import { string } from "zod";

const bookingRequest =async(req:Request,res:Response)=>{
    try {
            const  userId =req.user?.id;
    const {bookId} = req.body;
    const payload ={userId,bookId} as ICreateBooking;

    const result = await bookingService.bookingRequest(payload)

    sendResponse(res,{
        success : true,
        statusCode : 201,
        message : "Your Booking Request Sent",
        data : result
    })
    } catch (error:any) {
        sendResponse(res,{
        success : false,
        statusCode : 500,
        message : error.message,
        error : error
    })
    }
};

const allBookings = async (req: Request, res: Response) => {
  try {
    const result = await bookingService.allBookings(req.query);

    sendResponse(res, {
      success: true,
      statusCode: 200, 
      message: "Booking Request Retrieved successfully",
      data: result.data,
      meta: result.meta,
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

const bookingDetails =async(req:Request,res:Response)=>{
    try {
    const {bookingId} = req.body;

    const result = await bookingService.bookingDetails(bookingId as string)

    sendResponse(res,{
        success : true,
        statusCode : 201,
        message : "Booking Details Retrieved successfully",
        data : result
    })
    } catch (error:any) {
        sendResponse(res,{
        success : false,
        statusCode : 500,
        message : error.message,
        error : error
    })
    }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const  payload  = req.body;
    const result = await bookingService.updateBooking(payload);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Booking Updated successfully",
      data: result,
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

export const bookingController ={
    bookingRequest,
    allBookings,
    updateBooking,
    bookingDetails
}
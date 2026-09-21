import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateBooking, IUpdateBooking } from "./booking.interface";

const bookingRequest = async(payload:ICreateBooking)=>{
    const {bookId,userId} = payload;
    const createBookingRequest = await prisma.booking.create({
        data : {
            userId,
            bookId
        }
    });

    return createBookingRequest
};

const allBookings = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      }
    }),
    prisma.booking.count(),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: bookings,
  };
};


const bookingDetails = async(bookingId : string)=>{
    const booking =await prisma.booking.findUnique({
        where:{
            id : bookingId
        },
        include :{
            user: true,
            book : true
        }
    });

    if(!booking){
        throw new Error("Booking Not Found")
    };

    return booking
}

const updateBooking = async (payload: IUpdateBooking) => {
  const {status,rejectReason,bookingId} =payload;
  const booking = await prisma.booking.findUnique({
    where: { id :bookingId },
  });

  if (!booking) {
    throw new Error("Booking Not Found");
  }

  let updateData = {};

  if(status === "APPROVED"){
    updateData ={
        status,
        approvedAt : new Date()
    }
  }
  if(status === "REJECTED"){
    updateData ={
        status,
        rejectionReason : rejectReason
    }
  }

  const result = await prisma.booking.update({
    where: { id : booking.id },
    data: updateData,
  });

  return result;
};

const MyBookings = async(userId:string)=>{

  const MyBookings = await prisma.booking.findMany({
    where:{
      userId : userId
    }
  });

  if(!MyBookings){
    throw new Error("Booking Not Found");
  };

  return MyBookings;
}

export const bookingService ={
    bookingRequest,
    allBookings,
    updateBooking,
    bookingDetails,
    MyBookings
}
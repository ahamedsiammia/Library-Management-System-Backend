import { BookingStatus } from "../../../generated/prisma/enums";

export interface ICreateBooking {
  userId: string;
  bookId: string;
}

export interface IUpdateBooking {
  status : BookingStatus;
  rejectReason ?: string;
  bookingId : string

}
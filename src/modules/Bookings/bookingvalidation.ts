import z from "zod"
import { BookingStatus } from "../../../generated/prisma/enums"

const UpdateBookingRequestZodSchema = z.object({
    status : z.enum(BookingStatus),
    rejectReason : z.string().optional(),
});


export const bookingValidation ={
    UpdateBookingRequestZodSchema
}
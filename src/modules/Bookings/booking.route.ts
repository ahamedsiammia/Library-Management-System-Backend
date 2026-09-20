import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { bookingController } from "./booking.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { bookingValidation } from "./bookingvalidation";

const router = Router();

router.post("/request",auth(Role.ADMIN,Role.LIBRARIAN,Role.USER),bookingController.bookingRequest);

router.get("/all-bookings",auth(Role.ADMIN,Role.LIBRARIAN),bookingController.allBookings);

router.get("/booking-details",auth(Role.ADMIN,Role.LIBRARIAN),bookingController.bookingDetails);


router.patch("/update-request",auth(Role.ADMIN,Role.LIBRARIAN),validateRequest(bookingValidation.UpdateBookingRequestZodSchema),bookingController.updateBooking)


export const bookingRouter = router;
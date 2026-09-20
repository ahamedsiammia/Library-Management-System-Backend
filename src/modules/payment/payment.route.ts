import { Router } from "express";
import { paymentController } from "./payment.contoller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/",paymentController.verifyPayment)

router.post("/create-payment",auth(Role.ADMIN,Role.USER,Role.LIBRARIAN),paymentController.createPayment)



export const paymentRouter = router;

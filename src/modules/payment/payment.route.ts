import { Router } from "express";
import { paymentController } from "./payment.contoller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { paymentValidation } from "./paymentvalidation";

const router = Router();
router.get("/my-payments",auth(Role.ADMIN,Role.LIBRARIAN,Role.USER),paymentController.allPayments);

router.post("/", paymentController.verifyPayment);
router.get("/", paymentController.verifyPayment);
router.post("/success", paymentController.verifyPayment);
router.get("/success", paymentController.verifyPayment);
router.post("/cancel", paymentController.verifyPayment);
router.get("/cancel", paymentController.verifyPayment);
router.post("/fail", paymentController.verifyPayment);
router.get("/fail", paymentController.verifyPayment);

router.post("/create-payment",auth(Role.ADMIN,Role.USER,Role.LIBRARIAN),paymentController.createPayment);

router.get("/all-payments",auth(Role.ADMIN,Role.LIBRARIAN),paymentController.allPayments);


router.get("/payment-details/:paymentId",auth(Role.ADMIN,Role.USER,Role.LIBRARIAN),paymentController.paymentDetails)


export const paymentRouter = router;

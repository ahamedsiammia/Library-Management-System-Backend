import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { userValidation } from "./uservalidation";

const router = Router();

router.post("/register",validateRequest(userValidation.userRegistrationSchema), userController.createUser);

router.post("/email-verification", userController.emailVerification);

router.post("/login",validateRequest(userValidation.userLoginZodSchema), userController.loginUser);

router.get("/get", userController.getAllUser);

router.get("/me", userController.getMe);

router.post("/logout", userController.logoutUser);

router.post("/google", userController.googleLogin);


router.post("/forgot-password",validateRequest(userValidation.ForgotPasswordZodSchema), userController.forgotPassword)

router.post("/reset-password",validateRequest(userValidation.ResetPasswordZodSchema),userController.resetPassword);

export const userRoute = router;

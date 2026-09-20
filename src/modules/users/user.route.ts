import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { userValidation } from "./uservalidation";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register",validateRequest(userValidation.userRegistrationSchema), userController.createUser);

router.post("/email-verification", userController.emailVerification);

router.post("/login",validateRequest(userValidation.userLoginZodSchema), userController.loginUser);

router.get("/all-user",auth(Role.LIBRARIAN,Role.ADMIN),userController.getAllUser);

router.patch("/update-profile",auth(Role.ADMIN,Role.LIBRARIAN,Role.USER),validateRequest(userValidation.UpdateUserProfileSchema),userController.UpdateProfile)

router.get("/me",auth(Role.ADMIN,Role.LIBRARIAN,Role.USER),validateRequest(userValidation.UpdateUserProfileSchema), userController.getMe);

router.post("/logout", userController.logoutUser);

router.post("/google", userController.googleLogin);


router.post("/forgot-password",validateRequest(userValidation.ForgotPasswordZodSchema), userController.forgotPassword)

router.post("/reset-password",validateRequest(userValidation.ResetPasswordZodSchema),userController.resetPassword);

export const userRoute = router;

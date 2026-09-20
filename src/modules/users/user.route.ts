import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { userValidation } from "./uservalidation";

const router = Router();

router.post("/register",validateRequest(userValidation.userRegistrationSchema), userController.createUser);

router.post("/login",validateRequest(userValidation.userLoginZodSchema), userController.loginUser);

router.get("/get", userController.getAllUser);

router.get("/me", userController.getMe);

router.post("/logout", userController.logoutUser);

router.post("/google", userController.googleLogin);

export const userRoute = router;

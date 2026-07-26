import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.post("/register", userController.createUser);

router.post("/login", userController.loginUser);

router.get("/get", userController.getAllUser);

router.get("/me", userController.getMe);

router.post("/logout", userController.logoutUser);

export const userRoute = router;
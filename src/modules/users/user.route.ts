import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.post("/register",userController.createUser);

router.get("/get",userController.getAllUser)



export const userRoute = router;
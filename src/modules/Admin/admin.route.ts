import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { adminController } from "./admin.controller";

const router = Router();

router.get("/all-librarian",auth(Role.ADMIN),adminController.AllLibrarian); 

export const adminRouter = router;
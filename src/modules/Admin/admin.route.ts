import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { adminController } from "./admin.controller";
import { LibrarianControllers } from "../librarian/librarian.controller";

const router = Router();

router.get("/all-librarian",auth(Role.ADMIN),adminController.AllLibrarian); 

router.patch("/update-status",auth(Role.ADMIN),LibrarianControllers.updateUserStatus)


export const adminRouter = router;
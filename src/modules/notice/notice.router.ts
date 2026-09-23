import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { noticeController } from "./notice.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { updateNoticeSchema } from "./noticeValidation";

const router = Router();

router.post("/create-notice",auth(Role.ADMIN,Role.LIBRARIAN),noticeController.createNotice)

router.get("/all-notice", auth(Role.ADMIN,Role.LIBRARIAN,Role.USER), noticeController.getAllNotices);

router.patch("/update-notice/:noticeId", auth(Role.ADMIN,Role.LIBRARIAN),validateRequest(updateNoticeSchema) , noticeController.updateNotice);

router.delete("/delete-notice/:id", auth(Role.ADMIN,Role.LIBRARIAN), noticeController.deleteNotice);

export const noticeRouter = router
import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { createReviewSchema, updateReviewSchema } from "./reviewvalidation";
import { reviewController } from "./review.controller";

const router = Router();

router.post("/create-review", auth(Role.ADMIN,Role.USER,Role.LIBRARIAN), validateRequest(createReviewSchema), reviewController.createReview);

router.patch("/update-review",auth(Role.ADMIN,Role.USER,Role.LIBRARIAN),validateRequest(updateReviewSchema),reviewController.updateReview);

router.get("/book-review", reviewController.getReviewsByBookId);

router.delete("/delete-review/:reviewId", auth(Role.USER,Role.ADMIN,Role.LIBRARIAN), reviewController.deleteReview);

export const reviewRouter = router
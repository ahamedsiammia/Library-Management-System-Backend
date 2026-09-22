import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().optional(),
  bookId : z.string()
});

export const updateReviewSchema = z.object({
  reviewId: z.string("Invalid review id"),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().trim().optional(),
});


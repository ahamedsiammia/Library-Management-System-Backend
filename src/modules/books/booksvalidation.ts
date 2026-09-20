import { z } from "zod";

 const updateBookZodSchema = z.object({
  title: z.string().trim().min(1).optional(),
  titleBn: z.string().trim().optional().nullable(),
  author: z.string().trim().min(1).optional(),
  authorBio: z.string().trim().optional().nullable(),
  category: z.string().trim().min(1).optional(),
  categoryBn: z.string().trim().optional().nullable(),
  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().int().min(0).optional(),
  badge: z.string().trim().optional().nullable(),
  coverImage: z.string().trim().min(1).optional(),

  isbn: z.string().trim().min(1).optional(),
  publisher: z.string().trim().min(1).optional(),
  publisherBn: z.string().trim().optional().nullable(),
  publicationYear: z.number().int().optional(),
  edition: z.string().trim().optional().nullable(),
  language: z.string().trim().optional(),
  pages: z.number().int().positive().optional(),
  format: z.string().trim().optional().nullable(),

  totalCopies: z.number().int().min(0).optional(),
  copiesAvailable: z.number().int().min(0).optional(),
  shelfLocation: z.string().trim().min(1).optional(),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "BORROWED"]).optional(), // তোমার BookStatus enum values বসাও

  description: z.string().trim().min(1).optional(),
  descriptionBn: z.string().trim().optional().nullable(),
  keyTopics: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const BooksValidation ={
    updateBookZodSchema
}


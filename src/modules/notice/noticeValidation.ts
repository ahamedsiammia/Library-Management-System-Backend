import z from "zod";

export const createNoticeSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
});


export const updateNoticeSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
});

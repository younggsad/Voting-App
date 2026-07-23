import { z } from "zod";

export const createPollSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must contain at least 3 characters")
    .max(100, "Title must contain at most 100 characters"),

  description: z.string().trim().max(500, "Description is too long").optional(),

  isAnonymous: z.boolean(),

  isMultipleChoice: z.boolean(),

  expiresAt: z.iso.datetime(),

  options: z
    .array(
      z.object({
        text: z.string().trim().min(1, "Option cannot be empty").max(100, "Option is too long"),
      })
    )
    .min(2, "Poll must contain at least 2 options")
    .max(10, "Poll can contain at most 10 options"),
});

export type CreatePollDto = z.infer<typeof createPollSchema>;

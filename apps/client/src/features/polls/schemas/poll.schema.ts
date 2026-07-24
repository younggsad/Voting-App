import { z } from "zod";

export const pollSchema = z.object({
  title: z.string().min(3, "Минимум 3 символа").max(100),

  description: z.string().max(500).optional(),

  isAnonymous: z.boolean(),

  isMultipleChoice: z.boolean(),

  expiresAt: z.string().min(1, "Select expiration date"),

  options: z
    .array(
      z.object({
        text: z.string().min(1),
      })
    )
    .min(2, "Минимум 2 варианта"),
});

export type PollFormValues = z.infer<typeof pollSchema>;

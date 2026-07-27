import { z } from "zod";

export const pollSchema = z.object({
  title: z.string().trim().min(3, "Минимум 3 символа").max(100, "Максимум 100 символов"),

  description: z.string().trim().max(500, "Максимум 500 символов").optional(),

  isAnonymous: z.boolean(),

  isMultipleChoice: z.boolean(),

  expiresAt: z.string().min(1, "Выберите дату окончания"),

  options: z
    .array(
      z.object({
        text: z
          .string()
          .trim()
          .min(1, "Вариант не может быть пустым")
          .max(100, "Максимум 100 символов"),
      })
    )
    .min(2, "Минимум 2 варианта")
    .max(10, "Максимум 10 вариантов"),
});

export type PollFormValues = z.infer<typeof pollSchema>;

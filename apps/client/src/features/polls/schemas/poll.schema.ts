import { z } from "zod";

export const pollSchema = z.object({
  title: z.string().trim().min(3, "Минимум 3 символа").max(100, "Максимум 100 символов"),

  description: z.string().trim().max(80, "Максимум 80 символов").optional(),

  isAnonymous: z.boolean(),

  isMultipleChoice: z.boolean(),

  expiresAt: z
    .string()
    .min(1, "Выберите дату окончания")
    .refine(
      (value) => {
        const date = new Date(value);

        return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
      },
      {
        message: "Дата окончания должна быть в будущем",
      }
    ),

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

import { z } from "zod";

export const voteSchema = z.object({
  optionIds: z
    .array(z.uuid("Invalid option id"))
    .min(1, "Select at least one option")
    .refine((optionIds) => new Set(optionIds).size === optionIds.length, {
      message: "Options must be unique",
    }),
});

export type VoteDto = z.infer<typeof voteSchema>;

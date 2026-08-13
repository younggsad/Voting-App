import { z } from "zod";

// DTO запроса на голосование
export const voteSchema = z.object({
  optionIds: z.array(z.uuid("Invalid option id")).min(1, "Select at least one option"),
});

export type VoteDto = z.infer<typeof voteSchema>;

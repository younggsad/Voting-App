import type { VoteDto } from "@/validators/vote.validator";

export class VoteService {
  async vote(pollId: string, data: VoteDto) {
    return {
      pollId,
      optionIds: data.optionIds,
    };
  }
}

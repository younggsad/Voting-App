import { VoteDto } from "@/validators/vote.validator";

export class VoteService {
  async vote(pollId: string, sessionId: string, data: VoteDto) {
    return {
      pollId,
      sessionId,
      optionIds: data.optionIds,
    };
  }
}

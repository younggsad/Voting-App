import type { Response } from "express";

import { VoteService } from "@/services/vote.service";
import type { SessionRequest } from "@/types/session-request";
import type { VoteDto } from "@/validators/vote.validator";

export class VoteController {
  private readonly voteService = new VoteService();

  vote = async (req: SessionRequest<{ id: string }, VoteDto>, res: Response): Promise<void> => {
    const result = await this.voteService.vote(req.params.id, req.sessionId, req.body);

    res.status(201).json(result);
  };
}

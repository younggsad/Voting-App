import type { Request, Response } from "express";

import { VoteService } from "@/services/vote.service";
import type { VoteDto } from "@/validators/vote.validator";

export class VoteController {
  private readonly voteService = new VoteService();

  vote = async (req: Request<{ id: string }, unknown, VoteDto>, res: Response): Promise<void> => {
    const result = await this.voteService.vote(req.params.id, req.body);

    res.status(201).json(result);
  };
}

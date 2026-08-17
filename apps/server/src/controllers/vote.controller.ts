import type { Request, Response } from "express";

import { AppError } from "@/errors/app.error";
import { ERROR_CODES } from "@/errors/codes";
import { VoteService } from "@/services/vote.service";
import type { VoteDto } from "@/validators/vote.validator";

export class VoteController {
  private readonly voteService = new VoteService();

  vote = async (req: Request<{ id: string }, unknown, VoteDto>, res: Response): Promise<void> => {
    if (!req.sessionId) {
      throw new AppError("Session is required", 401, ERROR_CODES.SESSION_REQUIRED);
    }

    if (!req.ip) {
      throw new AppError("Unable to determine client IP", 400, ERROR_CODES.BAD_REQUEST);
    }

    const result = await this.voteService.vote(req.params.id, req.sessionId, req.ip, req.body);

    res.status(201).json(result);
  };
}

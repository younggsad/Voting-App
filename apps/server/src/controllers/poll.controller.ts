import type { Request, Response } from "express";

import { PollService } from "@/services/poll.service";
import type { CreatePollDto } from "@/validators/poll.validator";

export class PollController {
  private readonly pollService = new PollService();

  create = async (
    req: Request<Record<string, never>, unknown, CreatePollDto>,
    res: Response
  ): Promise<void> => {
    const poll = await this.pollService.create(req.body);

    res.status(201).json(poll);
  };

  findById = async (req: Request<{ id: string }, unknown>, res: Response): Promise<void> => {
    const poll = await this.pollService.findById(req.params.id, req.sessionId!);

    res.json(poll);
  };
}

import type { Request, Response } from "express";

import { PollService } from "@/services/poll.service";

const pollService = new PollService();

export class PollController {
  async create(req: Request, res: Response): Promise<void> {
    const poll = await pollService.create(req.body);

    res.status(201).json(poll);
  }

  async findById(req: Request, res: Response): Promise<void> {
    const poll = await pollService.findById(req.params.id);

    res.json(poll);
  }
}

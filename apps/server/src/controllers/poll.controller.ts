import type { Request, Response } from "express";

import { PollService } from "@/services/poll.service";

const pollService = new PollService();

export class PollController {
  async create(req: Request, res: Response) {
    const poll = await pollService.create(req.body);

    return res.status(201).json(poll);
  }

  async findById(req: Request, res: Response) {
    const poll = await pollService.findById(req.params.id);

    return res.json(poll);
  }
}

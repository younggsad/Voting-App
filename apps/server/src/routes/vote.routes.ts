import { Router } from "express";

import { VoteController } from "@/controllers/vote.controller";
import { validate } from "@/middlewares/validate.middleware";
import { voteSchema } from "@/validators/vote.validator";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

const voteController = new VoteController();

// Голосование в опросе
router.post("/:id/vote", validate(voteSchema), asyncHandler(voteController.vote));

export default router;

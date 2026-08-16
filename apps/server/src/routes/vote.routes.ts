import { Router } from "express";

import { VoteController } from "@/controllers/vote.controller";
import { validate } from "@/middlewares/validate.middleware";
import { voteSchema } from "@/validators/vote.validator";
import { asyncHandler } from "@/utils/async-handler";
import { sessionMiddleware } from "@/middlewares/session.middleware";
import { requireSession } from "@/middlewares/require-session.middleware";

const router = Router();

const voteController = new VoteController();

// Голосование в опросе
router.post(
  "/:id/vote",
  sessionMiddleware,
  requireSession,
  validate(voteSchema),
  asyncHandler(voteController.vote)
);

export default router;

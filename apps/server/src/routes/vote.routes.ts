import { Router } from "express";

import { VoteController } from "@/controllers/vote.controller";

import { voteSchema } from "@/validators/vote.validator";

import { requireSession } from "@/middlewares/require-session.middleware";
import { sessionMiddleware } from "@/middlewares/session.middleware";
import { validate } from "@/middlewares/validate.middleware";

import { asyncHandler } from "@/utils/async-handler";
import { voteLimiter } from "@/utils/voteLimiter";

const router = Router();

const voteController = new VoteController();

router.post(
  "/:id/vote",
  voteLimiter,
  validate(voteSchema),
  sessionMiddleware,
  requireSession,
  asyncHandler(voteController.vote)
);

export default router;

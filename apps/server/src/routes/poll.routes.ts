import { Router } from "express";

import { PollController } from "@/controllers/poll.controller";

import { asyncHandler } from "@/utils/async-handler";

import { createPollSchema } from "@/validators/poll.validator";

import { validate } from "@/middlewares/validate.middleware";
import { requireSession } from "@/middlewares/require-session.middleware";
import { sessionMiddleware } from "@/middlewares/session.middleware";

const router = Router();

const pollController = new PollController();

router.post(
  "/",
  sessionMiddleware,
  requireSession,
  validate(createPollSchema),
  asyncHandler(pollController.create)
);

router.get("/mine", sessionMiddleware, requireSession, asyncHandler(pollController.findMine));

router.get("/:id", sessionMiddleware, requireSession, asyncHandler(pollController.findById));

export default router;

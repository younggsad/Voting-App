import { Router } from "express";

import { PollController } from "@/controllers/poll.controller";

import { asyncHandler } from "@/utils/async-handler";

import { createPollSchema } from "@/validators/poll.validator";

import { validate } from "@/middlewares/validate.middleware";
import { requireSession } from "@/middlewares/require-session.middleware";
import { sessionMiddleware } from "@/middlewares/session.middleware";

const router = Router();

const pollController = new PollController();

// Создание нового опроса
router.post("/", validate(createPollSchema), asyncHandler(pollController.create));

// Получение опроса с результатами
router.get("/:id", sessionMiddleware, requireSession, asyncHandler(pollController.findById));

export default router;

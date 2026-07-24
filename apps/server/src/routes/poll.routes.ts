import { Router } from "express";

import { PollController } from "@/controllers/poll.controller";
import { asyncHandler } from "@/utils/async-handler";
import { validate } from "@/middlewares/validate.middleware";
import { createPollSchema } from "@/validators/poll.validator";

const router = Router();

const pollController = new PollController();

// Создание нового опроса
router.post("/", validate(createPollSchema), asyncHandler(pollController.create));

// Получение опроса с результатами
router.get("/:id", asyncHandler(pollController.findById));

export default router;

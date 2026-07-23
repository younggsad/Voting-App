import { Router } from "express";

import { PollController } from "@/controllers/poll.controller";
import { validate } from "@/middlewares/validate.middleware";
import { createPollSchema } from "@/validators/poll.validator";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();
const pollController = new PollController();

router.post(
  "/",
  validate(createPollSchema),
  asyncHandler(pollController.create.bind(pollController))
);

router.get("/:id", asyncHandler(pollController.findById.bind(pollController)));

export default router;

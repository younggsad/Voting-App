import type { RequestHandler } from "express";

import { AppError } from "@/errors/app.error";

export const requireSession: RequestHandler = (req, _res, next) => {
  if (!req.sessionId) {
    next(new AppError("Session is required", 401, "SESSION_REQUIRED"));

    return;
  }

  next();
};

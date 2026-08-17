import type { RequestHandler } from "express";

import { AppError } from "@/errors/app.error";
import { ERROR_CODES } from "@/errors/codes";

export const requireSession: RequestHandler = (req, _res, next) => {
  if (!req.sessionId) {
    next(new AppError("Session is required", 401, ERROR_CODES.SESSION_REQUIRED));
    return;
  }

  next();
};

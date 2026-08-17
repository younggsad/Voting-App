import type { RequestHandler } from "express";

import { ERROR_CODES } from "@/errors/codes";
import { UnauthorizedError } from "@/errors/unauthorized.error";

export const requireSession: RequestHandler = (req, _res, next) => {
  if (!req.sessionId) {
    next(new UnauthorizedError("Session is required", undefined, ERROR_CODES.SESSION_REQUIRED));
    return;
  }

  next();
};

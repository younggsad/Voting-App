import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";

const SESSION_COOKIE_NAME = "sessionId";

export const sessionMiddleware: RequestHandler = (req, res, next) => {
  const existingSessionId = req.cookies?.[SESSION_COOKIE_NAME];

  if (existingSessionId) {
    req.sessionId = existingSessionId;

    next();
    return;
  }

  const sessionId = randomUUID();

  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  req.sessionId = sessionId;

  next();
};

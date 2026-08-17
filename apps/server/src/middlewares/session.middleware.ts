import type { RequestHandler } from "express";

import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from "@/constants/session";
import type { SessionServiceContract } from "@/types/session-service";
import { SessionService } from "@/services/session.service";

export const createSessionMiddleware = (sessionService: SessionServiceContract): RequestHandler => {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.[SESSION_COOKIE_NAME];

      if (token) {
        const session = await sessionService.findByToken(token);

        if (session) {
          req.sessionId = session.id;
          next();
          return;
        }
      }

      const session = await sessionService.create();

      res.cookie(SESSION_COOKIE_NAME, session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_TTL_MS,
      });

      req.sessionId = session.id;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const sessionMiddleware = createSessionMiddleware(new SessionService());

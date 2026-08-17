import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { requireSession } from "./require-session.middleware";
import { errorMiddleware } from "./error.middleware";

const createApp = (sessionId?: string) => {
  const app = express();

  app.get(
    "/test",
    (req, res, next) => {
      if (sessionId !== undefined) {
        req.sessionId = sessionId;
      }

      next();
    },
    requireSession,
    (_req, res) => {
      res.status(200).json({
        message: "OK",
      });
    }
  );

  app.use(errorMiddleware);

  return app;
};

describe("requireSession", () => {
  it("should allow request when session exists", async () => {
    const app = createApp("session-123");

    const response = await request(app).get("/test");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      message: "OK",
    });
  });

  it("should return 401 when session is missing", async () => {
    const app = createApp();

    const response = await request(app).get("/test");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Session is required",
      code: "SESSION_REQUIRED",
      details: undefined,
    });
  });
});

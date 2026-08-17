import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { sessionMiddleware } from "./session.middleware";

const createApp = () => {
  const app = express();

  app.use(cookieParser());

  app.get("/test", sessionMiddleware, (req, res) => {
    res.json({
      sessionId: req.sessionId,
    });
  });

  return app;
};

describe("sessionMiddleware", () => {
  it("should create a new session when cookie is missing", async () => {
    const app = createApp();

    const response = await request(app).get("/test");

    expect(response.status).toBe(200);

    expect(response.body.sessionId).toEqual(expect.any(String));

    expect(response.headers["set-cookie"]).toBeDefined();

    expect(response.headers["set-cookie"][0]).toContain("sessionId=");
  });

  it("should reuse existing session from cookie", async () => {
    const app = createApp();

    const response = await request(app).get("/test").set("Cookie", "sessionId=existing-session-id");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      sessionId: "existing-session-id",
    });

    expect(response.headers["set-cookie"]).toBeUndefined();
  });
});

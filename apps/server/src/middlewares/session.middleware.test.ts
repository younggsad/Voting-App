import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from "@/constants/session";

import { createSessionMiddleware } from "./session.middleware";

import type { SessionServiceContract } from "@/types/session-service";

const createMockSessionService = () => ({
  create: vi.fn(),
  findByToken: vi.fn(),
});

const createApp = (sessionService: SessionServiceContract) => {
  const app = express();

  app.use(cookieParser());

  app.get("/test", createSessionMiddleware(sessionService), (req, res) => {
    res.status(200).json({
      sessionId: req.sessionId,
    });
  });

  return app;
};

describe("sessionMiddleware", () => {
  let sessionService: ReturnType<typeof createMockSessionService>;

  beforeEach(() => {
    sessionService = createMockSessionService();
  });

  it("should create a new session when cookie is missing", async () => {
    sessionService.create.mockResolvedValue({
      id: "session-1",
      token: "new-session-token",
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });

    const app = createApp(sessionService);

    const response = await request(app).get("/test");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      sessionId: "session-1",
    });

    expect(sessionService.create).toHaveBeenCalledOnce();
    expect(sessionService.findByToken).not.toHaveBeenCalled();

    const cookie = response.headers["set-cookie"][0];

    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=new-session-token`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("SameSite=Strict");
  });

  it("should reuse existing valid session", async () => {
    sessionService.findByToken.mockResolvedValue({
      id: "session-1",
      tokenHash: "hashed-token",
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const app = createApp(sessionService);

    const response = await request(app)
      .get("/test")
      .set("Cookie", `${SESSION_COOKIE_NAME}=existing-token`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      sessionId: "session-1",
    });

    expect(sessionService.findByToken).toHaveBeenCalledWith("existing-token");
    expect(sessionService.create).not.toHaveBeenCalled();

    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("should create a new session when token is invalid", async () => {
    sessionService.findByToken.mockResolvedValue(null);

    sessionService.create.mockResolvedValue({
      id: "session-2",
      token: "new-session-token",
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });

    const app = createApp(sessionService);

    const response = await request(app)
      .get("/test")
      .set("Cookie", `${SESSION_COOKIE_NAME}=invalid-token`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      sessionId: "session-2",
    });

    expect(sessionService.findByToken).toHaveBeenCalledWith("invalid-token");
    expect(sessionService.create).toHaveBeenCalledOnce();

    expect(response.headers["set-cookie"]).toBeDefined();
  });
});

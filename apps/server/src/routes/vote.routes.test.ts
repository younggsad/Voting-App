import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { errorMiddleware } from "@/middlewares/error.middleware";
import { SessionService } from "@/services/session.service";
import { VoteService } from "@/services/vote.service";
import { SESSION_COOKIE_NAME } from "@/constants/session";

import voteRoutes from "./vote.routes";

const POLL_ID = "550e8400-e29b-41d4-a716-446655440000";
const OPTION_ID = "550e8400-e29b-41d4-a716-446655440001";
const SESSION_ID = "550e8400-e29b-41d4-a716-446655440002";
const VOTE_ID = "550e8400-e29b-41d4-a716-446655440003";

const SESSION_TOKEN = "existing-session-token";

const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.use("/polls", voteRoutes);

  app.use(errorMiddleware);

  return app;
};

describe("POST /:id/vote", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a vote and return 201", async () => {
    const voteResult = {
      id: VOTE_ID,
      pollId: POLL_ID,
      sessionId: SESSION_ID,
      optionIds: [OPTION_ID],
      createdAt: new Date(),
    };

    const voteSpy = vi.spyOn(VoteService.prototype, "vote").mockResolvedValue(voteResult);

    const sessionSpy = vi.spyOn(SessionService.prototype, "create").mockResolvedValue({
      id: SESSION_ID,
      token: "new-session-token",
      expiresAt: new Date(Date.now() + 60_000),
    });

    const app = createApp();

    const response = await request(app)
      .post(`/polls/${POLL_ID}/vote`)
      .send({
        optionIds: [OPTION_ID],
      });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      id: VOTE_ID,
      pollId: POLL_ID,
      sessionId: SESSION_ID,
      optionIds: [OPTION_ID],
      createdAt: expect.any(String),
    });

    expect(response.headers["set-cookie"]).toBeDefined();

    expect(sessionSpy).toHaveBeenCalledOnce();

    expect(voteSpy).toHaveBeenCalledWith(POLL_ID, SESSION_ID, expect.any(String), {
      optionIds: [OPTION_ID],
    });
  });

  it("should reuse existing session cookie", async () => {
    const voteResult = {
      id: VOTE_ID,
      pollId: POLL_ID,
      sessionId: SESSION_ID,
      optionIds: [OPTION_ID],
      createdAt: new Date(),
    };

    const voteSpy = vi.spyOn(VoteService.prototype, "vote").mockResolvedValue(voteResult);

    const findSessionSpy = vi.spyOn(SessionService.prototype, "findByToken").mockResolvedValue({
      id: SESSION_ID,
      tokenHash: "hashed-token",
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createSessionSpy = vi.spyOn(SessionService.prototype, "create");

    const app = createApp();

    const response = await request(app)
      .post(`/polls/${POLL_ID}/vote`)
      .set("Cookie", `${SESSION_COOKIE_NAME}=${SESSION_TOKEN}`)
      .send({
        optionIds: [OPTION_ID],
      });

    expect(response.status).toBe(201);

    expect(findSessionSpy).toHaveBeenCalledWith(SESSION_TOKEN);

    expect(createSessionSpy).not.toHaveBeenCalled();

    expect(voteSpy).toHaveBeenCalledWith(POLL_ID, SESSION_ID, expect.any(String), {
      optionIds: [OPTION_ID],
    });

    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("should return 400 for invalid vote data", async () => {
    const voteSpy = vi.spyOn(VoteService.prototype, "vote");

    const sessionSpy = vi.spyOn(SessionService.prototype, "create");

    const app = createApp();

    const response = await request(app).post(`/polls/${POLL_ID}/vote`).send({
      optionIds: [],
    });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
    });

    expect(voteSpy).not.toHaveBeenCalled();
    expect(sessionSpy).not.toHaveBeenCalled();
  });

  it("should propagate service errors to error middleware", async () => {
    const serviceError = new Error("Vote failed");

    const voteSpy = vi.spyOn(VoteService.prototype, "vote").mockRejectedValue(serviceError);

    vi.spyOn(SessionService.prototype, "create").mockResolvedValue({
      id: SESSION_ID,
      token: "new-session-token",
      expiresAt: new Date(Date.now() + 60_000),
    });

    const app = createApp();

    const response = await request(app)
      .post(`/polls/${POLL_ID}/vote`)
      .send({
        optionIds: [OPTION_ID],
      });

    expect(response.status).toBe(500);

    expect(response.body).toEqual({
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });

    expect(voteSpy).toHaveBeenCalled();
  });
});

import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VoteService } from "@/services/vote.service";
import { errorMiddleware } from "@/middlewares/error.middleware";

import voteRoutes from "./vote.routes";

const POLL_ID = "550e8400-e29b-41d4-a716-446655440000";
const OPTION_ID = "550e8400-e29b-41d4-a716-446655440001";
const SESSION_ID = "550e8400-e29b-41d4-a716-446655440002";
const VOTE_ID = "550e8400-e29b-41d4-a716-446655440003";

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
      sessionId: expect.any(String),
      optionIds: [OPTION_ID],
      createdAt: expect.any(String),
    });

    expect(response.headers["set-cookie"]).toBeDefined();

    expect(voteSpy).toHaveBeenCalledWith(POLL_ID, expect.any(String), expect.any(String), {
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

    const app = createApp();

    const response = await request(app)
      .post(`/polls/${POLL_ID}/vote`)
      .set("Cookie", `sessionId=${SESSION_ID}`)
      .send({
        optionIds: [OPTION_ID],
      });

    expect(response.status).toBe(201);

    expect(voteSpy).toHaveBeenCalledWith(POLL_ID, SESSION_ID, expect.any(String), {
      optionIds: [OPTION_ID],
    });

    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("should return 400 for invalid vote data", async () => {
    const voteSpy = vi.spyOn(VoteService.prototype, "vote");

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
  });

  it("should propagate service errors to error middleware", async () => {
    const serviceError = new Error("Vote failed");

    const voteSpy = vi.spyOn(VoteService.prototype, "vote").mockRejectedValue(serviceError);

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

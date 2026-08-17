import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { errorMiddleware } from "@/middlewares/error.middleware";
import { PollService } from "@/services/poll.service";

import pollRoutes from "./poll.routes";

const POLL_ID = "550e8400-e29b-41d4-a716-446655440000";
const OPTION_ID_1 = "550e8400-e29b-41d4-a716-446655440001";
const OPTION_ID_2 = "550e8400-e29b-41d4-a716-446655440002";

const createApp = () => {
  const app = express();

  app.use(express.json());

  app.use("/polls", pollRoutes);

  app.use(errorMiddleware);

  return app;
};

describe("Poll routes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /polls", () => {
    it("should create a poll and return 201", async () => {
      const pollResult = {
        id: POLL_ID,
        title: "Test poll",
        description: "Description",
        isAnonymous: false,
        isMultipleChoice: false,
        expiresAt: new Date("2026-12-01T12:00:00.000Z"),
        options: [
          {
            id: OPTION_ID_1,
            text: "Option 1",
            votesCount: 0,
          },
          {
            id: OPTION_ID_2,
            text: "Option 2",
            votesCount: 0,
          },
        ],
      };

      const createSpy = vi.spyOn(PollService.prototype, "create").mockResolvedValue(pollResult);

      const app = createApp();

      const payload = {
        title: "Test poll",
        description: "Description",
        isAnonymous: false,
        isMultipleChoice: false,
        expiresAt: "2026-12-01T12:00:00.000Z",
        options: [
          {
            text: "Option 1",
          },
          {
            text: "Option 2",
          },
        ],
      };

      const response = await request(app).post("/polls").send(payload);

      expect(response.status).toBe(201);

      expect(response.body).toEqual({
        id: POLL_ID,
        title: "Test poll",
        description: "Description",
        isAnonymous: false,
        isMultipleChoice: false,
        expiresAt: "2026-12-01T12:00:00.000Z",
        options: [
          {
            id: OPTION_ID_1,
            text: "Option 1",
            votesCount: 0,
          },
          {
            id: OPTION_ID_2,
            text: "Option 2",
            votesCount: 0,
          },
        ],
      });

      expect(createSpy).toHaveBeenCalledOnce();
      expect(createSpy).toHaveBeenCalledWith(payload);
    });

    it("should return 400 for invalid poll data", async () => {
      const createSpy = vi.spyOn(PollService.prototype, "create");

      const app = createApp();

      const response = await request(app).post("/polls").send({
        title: "",
        options: [],
      });

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        message: "Validation failed",
        code: "VALIDATION_ERROR",
      });

      expect(createSpy).not.toHaveBeenCalled();
    });

    it("should propagate service errors to error middleware", async () => {
      const serviceError = new Error("Failed to create poll");

      const createSpy = vi.spyOn(PollService.prototype, "create").mockRejectedValue(serviceError);

      const app = createApp();

      const response = await request(app)
        .post("/polls")
        .send({
          title: "Test poll",
          description: "Description",
          isAnonymous: false,
          isMultipleChoice: false,
          expiresAt: "2026-12-01T12:00:00.000Z",
          options: [
            {
              text: "Option 1",
            },
            {
              text: "Option 2",
            },
          ],
        });

      expect(response.status).toBe(500);

      expect(response.body).toEqual({
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      });

      expect(createSpy).toHaveBeenCalledOnce();
    });
  });

  describe("GET /polls/:id", () => {
    it("should return a poll with results", async () => {
      const pollResult = {
        id: POLL_ID,
        title: "Test poll",
        description: "Description",
        isAnonymous: false,
        isMultipleChoice: false,
        expiresAt: new Date("2026-12-01T12:00:00.000Z"),
        options: [
          {
            id: OPTION_ID_1,
            text: "Option 1",
            votesCount: 7,
          },
          {
            id: OPTION_ID_2,
            text: "Option 2",
            votesCount: 3,
          },
        ],
      };

      const findByIdSpy = vi.spyOn(PollService.prototype, "findById").mockResolvedValue(pollResult);

      const app = createApp();

      const response = await request(app).get(`/polls/${POLL_ID}`);

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        id: POLL_ID,
        title: "Test poll",
        description: "Description",
        isAnonymous: false,
        isMultipleChoice: false,
        expiresAt: "2026-12-01T12:00:00.000Z",
        options: [
          {
            id: OPTION_ID_1,
            text: "Option 1",
            votesCount: 7,
          },
          {
            id: OPTION_ID_2,
            text: "Option 2",
            votesCount: 3,
          },
        ],
      });

      expect(findByIdSpy).toHaveBeenCalledOnce();
      expect(findByIdSpy).toHaveBeenCalledWith(POLL_ID);
    });

    it("should propagate service errors to error middleware", async () => {
      const serviceError = new Error("Poll not found");

      const findByIdSpy = vi
        .spyOn(PollService.prototype, "findById")
        .mockRejectedValue(serviceError);

      const app = createApp();

      const response = await request(app).get(`/polls/${POLL_ID}`);

      expect(response.status).toBe(500);

      expect(response.body).toEqual({
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      });

      expect(findByIdSpy).toHaveBeenCalledOnce();
      expect(findByIdSpy).toHaveBeenCalledWith(POLL_ID);
    });
  });
});

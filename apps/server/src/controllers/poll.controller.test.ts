import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PollService } from "@/services/poll.service";
import type { CreatePollDto } from "@/validators/poll.validator";

import { PollController } from "./poll.controller";

describe("PollController", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("create", () => {
    it("should create a poll and return 201", async () => {
      const body: CreatePollDto = {
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

      const poll = {
        id: "poll-1",
        title: "Test poll",
        description: "Description",
        isAnonymous: false,
        isMultipleChoice: false,
        expiresAt: new Date("2026-12-01T12:00:00.000Z"),
        options: [
          {
            id: "option-1",
            text: "Option 1",
            votesCount: 0,
          },
          {
            id: "option-2",
            text: "Option 2",
            votesCount: 0,
          },
        ],
      };

      const createSpy = vi.spyOn(PollService.prototype, "create").mockResolvedValue(poll);

      const controller = new PollController();

      const req = {
        body,
        sessionId: "session-1",
      } as Request<Record<string, never>, unknown, CreatePollDto>;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      await controller.create(req, res);

      expect(createSpy).toHaveBeenCalledOnce();
      expect(createSpy).toHaveBeenCalledWith(body, "session-1");

      expect(res.status).toHaveBeenCalledOnce();
      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledOnce();
      expect(res.json).toHaveBeenCalledWith(poll);
    });

    it("should propagate service errors", async () => {
      const serviceError = new Error("Failed to create poll");

      const createSpy = vi.spyOn(PollService.prototype, "create").mockRejectedValue(serviceError);

      const controller = new PollController();

      const body: CreatePollDto = {
        title: "Test poll",
        description: "Description",
        isAnonymous: false,
        isMultipleChoice: false,
        expiresAt: "2026-12-01T12:00:00.000Z",
        options: [
          {
            text: "Option 1",
          },
        ],
      };

      const req = {
        body,
        sessionId: "session-1",
      } as Request<Record<string, never>, unknown, CreatePollDto>;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      await expect(controller.create(req, res)).rejects.toBe(serviceError);

      expect(createSpy).toHaveBeenCalledOnce();
      expect(createSpy).toHaveBeenCalledWith(body, "session-1");

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return poll by id", async () => {
      const pollId = "poll-1";
      const sessionId = "session-1";

      const poll = {
        id: pollId,
        title: "Test poll",
        description: "Description",
        isAnonymous: false,
        isMultipleChoice: false,
        expiresAt: new Date("2026-12-01T12:00:00.000Z"),
        options: [
          {
            id: "option-1",
            text: "Option 1",
            votesCount: 7,
          },
          {
            id: "option-2",
            text: "Option 2",
            votesCount: 3,
          },
        ],
        hasVoted: false,
      };

      const findByIdSpy = vi.spyOn(PollService.prototype, "findById").mockResolvedValue(poll);

      const controller = new PollController();

      const req = {
        params: {
          id: pollId,
        },
        sessionId,
      } as Request<{ id: string }>;

      const res = {
        json: vi.fn(),
      } as unknown as Response;

      await controller.findById(req, res);

      expect(findByIdSpy).toHaveBeenCalledOnce();
      expect(findByIdSpy).toHaveBeenCalledWith(pollId, sessionId);

      expect(res.json).toHaveBeenCalledOnce();
      expect(res.json).toHaveBeenCalledWith(poll);
    });

    it("should propagate service errors", async () => {
      const serviceError = new Error("Poll not found");
      const sessionId = "session-1";

      const findByIdSpy = vi
        .spyOn(PollService.prototype, "findById")
        .mockRejectedValue(serviceError);

      const controller = new PollController();

      const req = {
        params: {
          id: "poll-1",
        },
        sessionId,
      } as Request<{ id: string }>;

      const res = {
        json: vi.fn(),
      } as unknown as Response;

      await expect(controller.findById(req, res)).rejects.toBe(serviceError);

      expect(findByIdSpy).toHaveBeenCalledOnce();
      expect(findByIdSpy).toHaveBeenCalledWith("poll-1", sessionId);

      expect(res.json).not.toHaveBeenCalled();
    });
  });
});

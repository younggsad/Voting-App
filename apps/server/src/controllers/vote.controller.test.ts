import { describe, expect, it, vi } from "vitest";

import { ERROR_CODES } from "@/errors/codes";
import { VoteService } from "@/services/vote.service";

import { VoteController } from "./vote.controller";

describe("VoteController.vote", () => {
  it("should vote and return 201", async () => {
    const serviceResult = {
      id: "vote-1",
      pollId: "poll-1",
      sessionId: "session-1",
      optionIds: ["option-1"],
      createdAt: new Date(),
    };

    const voteSpy = vi.spyOn(VoteService.prototype, "vote").mockResolvedValue(serviceResult);

    const controller = new VoteController();

    const req = {
      params: {
        id: "poll-1",
      },
      sessionId: "session-1",
      ip: "127.0.0.1",
      body: {
        optionIds: ["option-1"],
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await controller.vote(req as never, res as never);

    expect(voteSpy).toHaveBeenCalledWith("poll-1", "session-1", "127.0.0.1", {
      optionIds: ["option-1"],
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(serviceResult);

    voteSpy.mockRestore();
  });

  it("should throw SESSION_REQUIRED when session is missing", async () => {
    const voteSpy = vi.spyOn(VoteService.prototype, "vote");

    const controller = new VoteController();

    const req = {
      params: {
        id: "poll-1",
      },
      sessionId: undefined,
      ip: "127.0.0.1",
      body: {
        optionIds: ["option-1"],
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await expect(controller.vote(req as never, res as never)).rejects.toMatchObject({
      statusCode: 401,
      code: ERROR_CODES.SESSION_REQUIRED,
    });

    expect(voteSpy).not.toHaveBeenCalled();

    voteSpy.mockRestore();
  });

  it("should throw BAD_REQUEST when client IP is missing", async () => {
    const voteSpy = vi.spyOn(VoteService.prototype, "vote");

    const controller = new VoteController();

    const req = {
      params: {
        id: "poll-1",
      },
      sessionId: "session-1",
      ip: undefined,
      body: {
        optionIds: ["option-1"],
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await expect(controller.vote(req as never, res as never)).rejects.toMatchObject({
      statusCode: 400,
      code: ERROR_CODES.BAD_REQUEST,
    });

    expect(voteSpy).not.toHaveBeenCalled();

    voteSpy.mockRestore();
  });

  it("should propagate service errors", async () => {
    const serviceError = new Error("Vote failed");

    const voteSpy = vi.spyOn(VoteService.prototype, "vote").mockRejectedValue(serviceError);

    const controller = new VoteController();

    const req = {
      params: {
        id: "poll-1",
      },
      sessionId: "session-1",
      ip: "127.0.0.1",
      body: {
        optionIds: ["option-1"],
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await expect(controller.vote(req as never, res as never)).rejects.toThrow("Vote failed");

    expect(voteSpy).toHaveBeenCalledWith("poll-1", "session-1", "127.0.0.1", {
      optionIds: ["option-1"],
    });

    voteSpy.mockRestore();
  });
});

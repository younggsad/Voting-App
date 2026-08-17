import { describe, expect, it, vi, beforeEach } from "vitest";

import { VoteService } from "./vote.service";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    poll: {
      findUnique: vi.fn(),
    },
    vote: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("VoteService.vote", () => {
  const service = new VoteService();

  const poll = {
    id: "poll-1",
    expiresAt: new Date("2026-12-01T12:00:00.000Z"),
    isMultipleChoice: false,
    options: [{ id: "option-1" }, { id: "option-2" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a vote for a valid single-choice poll", async () => {
    vi.mocked(prisma.poll.findUnique).mockResolvedValue(poll as never);

    vi.mocked(prisma.vote.findUnique).mockResolvedValue(null);

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        vote: {
          create: vi.fn().mockResolvedValue({
            id: "vote-1",
            pollId: "poll-1",
            sessionId: "session-1",
            ipAddress: "127.0.0.1",
            createdAt: new Date("2026-08-17T12:00:00.000Z"),
          }),
        },
        voteOption: {
          createMany: vi.fn(),
        },
      };

      return callback(tx as never);
    });

    const result = await service.vote("poll-1", "session-1", "127.0.0.1", {
      optionIds: ["option-1"],
    });

    expect(result).toEqual({
      id: "vote-1",
      pollId: "poll-1",
      sessionId: "session-1",
      optionIds: ["option-1"],
      createdAt: expect.any(Date),
    });
  });

  it("should throw when poll does not exist", async () => {
    vi.mocked(prisma.poll.findUnique).mockResolvedValue(null);

    await expect(
      service.vote("poll-1", "session-1", "127.0.0.1", {
        optionIds: ["option-1"],
      })
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("should throw when poll has expired", async () => {
    vi.mocked(prisma.poll.findUnique).mockResolvedValue({
      ...poll,
      expiresAt: new Date("2020-01-01T00:00:00.000Z"),
    } as never);

    await expect(
      service.vote("poll-1", "session-1", "127.0.0.1", {
        optionIds: ["option-1"],
      })
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("should throw when option does not belong to poll", async () => {
    vi.mocked(prisma.poll.findUnique).mockResolvedValue(poll as never);

    await expect(
      service.vote("poll-1", "session-1", "127.0.0.1", {
        optionIds: ["unknown-option"],
      })
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("should throw when multiple options are selected in single-choice poll", async () => {
    vi.mocked(prisma.poll.findUnique).mockResolvedValue(poll as never);

    await expect(
      service.vote("poll-1", "session-1", "127.0.0.1", {
        optionIds: ["option-1", "option-2"],
      })
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("should throw when session has already voted", async () => {
    vi.mocked(prisma.poll.findUnique).mockResolvedValue(poll as never);

    vi.mocked(prisma.vote.findUnique).mockResolvedValue({
      id: "vote-existing",
    } as never);

    await expect(
      service.vote("poll-1", "session-1", "127.0.0.1", {
        optionIds: ["option-1"],
      })
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("should allow multiple options for multiple-choice poll", async () => {
    vi.mocked(prisma.poll.findUnique).mockResolvedValue({
      ...poll,
      isMultipleChoice: true,
    } as never);

    vi.mocked(prisma.vote.findUnique).mockResolvedValue(null);

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        vote: {
          create: vi.fn().mockResolvedValue({
            id: "vote-1",
            pollId: "poll-1",
            sessionId: "session-1",
            ipAddress: "127.0.0.1",
            createdAt: new Date(),
          }),
        },
        voteOption: {
          createMany: vi.fn(),
        },
      };

      return callback(tx as never);
    });

    const result = await service.vote("poll-1", "session-1", "127.0.0.1", {
      optionIds: ["option-1", "option-2"],
    });

    expect(result.optionIds).toEqual(["option-1", "option-2"]);
  });

  it("should create vote and vote options in a transaction", async () => {
    vi.mocked(prisma.poll.findUnique).mockResolvedValue({
      id: "poll-1",
      expiresAt: new Date("2099-01-01"),
      isMultipleChoice: true,
      options: [{ id: "option-1" }, { id: "option-2" }],
    } as never);

    vi.mocked(prisma.vote.findUnique).mockResolvedValue(null);

    const createdVote = {
      id: "vote-1",
      pollId: "poll-1",
      sessionId: "session-1",
      ipAddress: "127.0.0.1",
      createdAt: new Date("2026-08-17T10:00:00.000Z"),
    };

    const tx = {
      vote: {
        create: vi.fn().mockResolvedValue(createdVote),
      },
      voteOption: {
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      return callback(tx as never);
    });

    const result = await service.vote("poll-1", "session-1", "127.0.0.1", {
      optionIds: ["option-1", "option-2"],
    });

    expect(tx.vote.create).toHaveBeenCalledWith({
      data: {
        pollId: "poll-1",
        sessionId: "session-1",
        ipAddress: "127.0.0.1",
      },
    });

    expect(tx.voteOption.createMany).toHaveBeenCalledWith({
      data: [
        {
          voteId: "vote-1",
          optionId: "option-1",
        },
        {
          voteId: "vote-1",
          optionId: "option-2",
        },
      ],
    });

    expect(result).toEqual({
      id: "vote-1",
      pollId: "poll-1",
      sessionId: "session-1",
      optionIds: ["option-1", "option-2"],
      createdAt: createdVote.createdAt,
    });
  });
});

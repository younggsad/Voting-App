import { beforeEach, describe, expect, it, vi } from "vitest";

import { ERROR_CODES } from "@/errors/codes";
import { prisma } from "@/lib/prisma";

import { PollService } from "./poll.service";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    poll: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    vote: {
      findUnique: vi.fn(),
    },
  },
}));

describe("PollService", () => {
  const service = new PollService();

  const mockPoll = {
    id: "poll-1",
    title: "Test poll",
    description: "Description",
    isAnonymous: false,
    isMultipleChoice: false,
    expiresAt: new Date("2026-08-01T12:00:00.000Z"),
    options: [
      {
        id: "option-1",
        text: "Option 1",
        _count: {
          voteOptions: 0,
        },
      },
      {
        id: "option-2",
        text: "Option 2",
        _count: {
          voteOptions: 0,
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(prisma.vote.findUnique).mockResolvedValue(null);
  });

  describe("create", () => {
    it("should create poll with options and return mapped response", async () => {
      vi.mocked(prisma.poll.create).mockResolvedValue(mockPoll as never);

      const result = await service.create({
        title: "Test poll",
        description: "Description",
        isAnonymous: false,
        isMultipleChoice: false,
        expiresAt: "2026-08-01T12:00:00.000Z",
        options: [
          {
            text: "Option 1",
          },
          {
            text: "Option 2",
          },
        ],
      });

      expect(prisma.poll.create).toHaveBeenCalledWith({
        data: {
          title: "Test poll",
          description: "Description",
          isAnonymous: false,
          isMultipleChoice: false,
          expiresAt: new Date("2026-08-01T12:00:00.000Z"),
          options: {
            create: [
              {
                text: "Option 1",
                position: 0,
              },
              {
                text: "Option 2",
                position: 1,
              },
            ],
          },
        },
        include: {
          options: {
            include: {
              _count: {
                select: {
                  voteOptions: true,
                },
              },
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      });

      expect(result).toEqual({
        id: "poll-1",
        title: "Test poll",
        description: "Description",
        isAnonymous: false,
        isMultipleChoice: false,
        expiresAt: new Date("2026-08-01T12:00:00.000Z"),
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
      });
    });

    it("should propagate database errors", async () => {
      const databaseError = new Error("Database error");

      vi.mocked(prisma.poll.create).mockRejectedValue(databaseError);

      await expect(
        service.create({
          title: "Test poll",
          description: "Description",
          isAnonymous: false,
          isMultipleChoice: false,
          expiresAt: "2026-08-01T12:00:00.000Z",
          options: [
            {
              text: "Option 1",
            },
            {
              text: "Option 2",
            },
          ],
        })
      ).rejects.toThrow("Database error");

      expect(prisma.poll.create).toHaveBeenCalledOnce();
    });
  });

  describe("findById", () => {
    it("should return poll with mapped results and hasVoted false", async () => {
      vi.mocked(prisma.poll.findUnique).mockResolvedValue(mockPoll as never);
      vi.mocked(prisma.vote.findUnique).mockResolvedValue(null);

      const result = await service.findById("poll-1", "session-1");

      expect(prisma.poll.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "poll-1",
          },
          include: expect.anything(),
        })
      );

      expect(prisma.vote.findUnique).toHaveBeenCalledWith({
        where: {
          pollId_sessionId: {
            pollId: "poll-1",
            sessionId: "session-1",
          },
        },
        select: {
          id: true,
        },
      });

      expect(result).toEqual({
        id: "poll-1",
        title: "Test poll",
        description: "Description",
        isAnonymous: false,
        isMultipleChoice: false,
        expiresAt: new Date("2026-08-01T12:00:00.000Z"),
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
        hasVoted: false,
      });
    });

    it("should return hasVoted true when session has voted", async () => {
      vi.mocked(prisma.poll.findUnique).mockResolvedValue(mockPoll as never);

      vi.mocked(prisma.vote.findUnique).mockResolvedValue({
        id: "vote-1",
      } as never);

      const result = await service.findById("poll-1", "session-1");

      expect(result.hasVoted).toBe(true);

      expect(prisma.vote.findUnique).toHaveBeenCalledWith({
        where: {
          pollId_sessionId: {
            pollId: "poll-1",
            sessionId: "session-1",
          },
        },
        select: {
          id: true,
        },
      });
    });

    it("should throw POLL_NOT_FOUND when poll does not exist", async () => {
      vi.mocked(prisma.poll.findUnique).mockResolvedValue(null);

      await expect(service.findById("poll-1", "session-1")).rejects.toMatchObject({
        statusCode: 404,
        code: ERROR_CODES.POLL_NOT_FOUND,
      });

      expect(prisma.poll.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "poll-1",
          },
        })
      );

      expect(prisma.vote.findUnique).not.toHaveBeenCalled();
    });

    it("should propagate database errors from poll query", async () => {
      const databaseError = new Error("Database error");

      vi.mocked(prisma.poll.findUnique).mockRejectedValue(databaseError);

      await expect(service.findById("poll-1", "session-1")).rejects.toThrow("Database error");

      expect(prisma.poll.findUnique).toHaveBeenCalledOnce();
      expect(prisma.vote.findUnique).not.toHaveBeenCalled();
    });

    it("should propagate database errors from vote query", async () => {
      const databaseError = new Error("Database error");

      vi.mocked(prisma.poll.findUnique).mockResolvedValue(mockPoll as never);
      vi.mocked(prisma.vote.findUnique).mockRejectedValue(databaseError);

      await expect(service.findById("poll-1", "session-1")).rejects.toThrow("Database error");

      expect(prisma.poll.findUnique).toHaveBeenCalledOnce();
      expect(prisma.vote.findUnique).toHaveBeenCalledOnce();
    });
  });
});

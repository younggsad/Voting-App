import { describe, expect, it, vi } from "vitest";

import { PollService } from "./poll.service";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    poll: {
      create: vi.fn(),
    },
  },
}));

describe("PollService.create", () => {
  it("should create poll with options and return mapped response", async () => {
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
            votes: 0,
          },
        },
        {
          id: "option-2",
          text: "Option 2",
          _count: {
            votes: 0,
          },
        },
      ],
    };

    vi.mocked(prisma.poll.create).mockResolvedValue(mockPoll as never);

    const service = new PollService();

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

    expect(prisma.poll.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Test poll",

          options: {
            create: [
              {
                text: "Option 1",
              },
              {
                text: "Option 2",
              },
            ],
          },
        }),
      })
    );

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
});

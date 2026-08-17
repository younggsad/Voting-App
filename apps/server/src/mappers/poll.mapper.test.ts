import { describe, expect, it } from "vitest";

import { mapPollToResponse } from "./poll.mapper";

describe("mapPollToResponse", () => {
  it("should map poll with vote counts", () => {
    const expiresAt = new Date("2026-12-01T12:00:00.000Z");

    const result = mapPollToResponse({
      id: "poll-1",
      title: "Test poll",
      description: "Description",
      isAnonymous: false,
      isMultipleChoice: true,
      expiresAt,

      options: [
        {
          id: "option-1",
          text: "Yes",
          _count: {
            voteOptions: 7,
          },
        },
        {
          id: "option-2",
          text: "No",
          _count: {
            voteOptions: 3,
          },
        },
      ],
    });

    expect(result).toEqual({
      id: "poll-1",
      title: "Test poll",
      description: "Description",
      isAnonymous: false,
      isMultipleChoice: true,
      expiresAt,

      options: [
        {
          id: "option-1",
          text: "Yes",
          votesCount: 7,
        },
        {
          id: "option-2",
          text: "No",
          votesCount: 3,
        },
      ],
    });
  });

  it("should preserve null description", () => {
    const result = mapPollToResponse({
      id: "poll-1",
      title: "Poll",
      description: null,
      isAnonymous: false,
      isMultipleChoice: false,
      expiresAt: new Date(),

      options: [],
    });

    expect(result.description).toBeNull();
  });

  it("should return an empty options array when poll has no options", () => {
    const result = mapPollToResponse({
      id: "poll-1",
      title: "Poll",
      description: null,
      isAnonymous: false,
      isMultipleChoice: false,
      expiresAt: new Date(),

      options: [],
    });

    expect(result.options).toEqual([]);
  });
});

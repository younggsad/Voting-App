import { describe, expect, it } from "vitest";

import { mapPollToResponse } from "./poll.mapper";

describe("mapPollToResponse", () => {
  it("should map poll with votes count", () => {
    const result = mapPollToResponse({
      id: "poll-1",
      title: "Poll",
      description: null,
      isAnonymous: false,
      isMultipleChoice: false,
      expiresAt: new Date(),

      options: [
        {
          id: "option-1",
          text: "Yes",
          _count: {
            voteOptions: 7,
          },
        },
      ],
    });

    expect(result).toEqual({
      id: "poll-1",
      title: "Poll",
      description: null,
      isAnonymous: false,
      isMultipleChoice: false,
      expiresAt: expect.any(Date),

      options: [
        {
          id: "option-1",
          text: "Yes",
          votesCount: 7,
        },
      ],
    });
  });
});

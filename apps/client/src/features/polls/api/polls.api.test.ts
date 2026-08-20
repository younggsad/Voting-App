import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/shared/api/client";

import { createPoll, createVote, getPollById } from "./polls.api";

vi.mock("@/shared/api/client", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const postMock = vi.mocked(api.post);
const getMock = vi.mocked(api.get);

describe("polls.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a poll", async () => {
    const request = {
      title: "Test poll",
      description: "Test description",
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
    };

    postMock.mockResolvedValueOnce({
      data: poll,
    } as never);

    const result = await createPoll(request);

    expect(postMock).toHaveBeenCalledOnce();
    expect(postMock).toHaveBeenCalledWith("/polls", request);
    expect(result).toEqual(poll);
  });

  it("should get a poll by id", async () => {
    const poll = {
      id: "poll-1",
      title: "Test poll",
    };

    getMock.mockResolvedValueOnce({
      data: poll,
    } as never);

    const result = await getPollById("poll-1");

    expect(getMock).toHaveBeenCalledOnce();
    expect(getMock).toHaveBeenCalledWith("/polls/poll-1");
    expect(result).toEqual(poll);
  });

  it("should create a vote", async () => {
    const request = {
      optionIds: ["option-1"],
    };

    const vote = {
      id: "vote-1",
      pollId: "poll-1",
      sessionId: "session-1",
      optionIds: ["option-1"],
      createdAt: "2026-08-18T12:00:00.000Z",
    };

    postMock.mockResolvedValueOnce({
      data: vote,
    } as never);

    const result = await createVote("poll-1", request);

    expect(postMock).toHaveBeenCalledOnce();
    expect(postMock).toHaveBeenCalledWith("/polls/poll-1/vote", request);
    expect(result).toEqual(vote);
  });
});

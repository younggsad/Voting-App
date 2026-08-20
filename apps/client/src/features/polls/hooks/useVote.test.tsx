import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createVote } from "../api/polls.api";
import { pollKeys } from "../query/poll.keys";
import type { CreateVoteResponse } from "../types";
import { useVote } from "./useVote";

vi.mock("../api/polls.api", () => ({
  createVote: vi.fn(),
}));

const createVoteMock = vi.mocked(createVote);

const createVoteResponse = (): CreateVoteResponse => ({
  id: "vote-1",
  pollId: "poll-1",
  sessionId: "session-1",
  optionIds: ["option-1"],
  createdAt: "2026-08-18T12:00:00.000Z",
});

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe("useVote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should submit vote successfully", async () => {
    const response = createVoteResponse();

    createVoteMock.mockResolvedValueOnce(response);

    const queryClient = createQueryClient();

    const { result } = renderHook(() => useVote("poll-1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(["option-1"]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(createVoteMock).toHaveBeenCalledOnce();
    expect(createVoteMock).toHaveBeenCalledWith("poll-1", {
      optionIds: ["option-1"],
    });

    expect(result.current.data).toEqual(response);
  });

  it("should expose error when voting fails", async () => {
    const error = new Error("Failed to vote");

    createVoteMock.mockRejectedValueOnce(error);

    const queryClient = createQueryClient();

    const { result } = renderHook(() => useVote("poll-1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(["option-1"]);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });

  it("should invalidate poll query after successful vote", async () => {
    const response = createVoteResponse();

    createVoteMock.mockResolvedValueOnce(response);

    const queryClient = createQueryClient();

    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useVote("poll-1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(["option-1", "option-2"]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: pollKeys.detail("poll-1"),
    });
  });
});

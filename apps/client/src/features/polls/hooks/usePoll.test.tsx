import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Poll } from "../types";
import { pollKeys } from "../types/poll.keys";
import { getPollById } from "../api/polls.api";
import { usePoll } from "./usePoll";

vi.mock("../api/polls.api", () => ({
  getPollById: vi.fn(),
}));

const getPollByIdMock = vi.mocked(getPollById);

const createTestPoll = (): Poll => ({
  id: "poll-1",
  title: "Test poll",
  description: "Test description",
  isAnonymous: false,
  isMultipleChoice: false,
  expiresAt: "2026-12-01T12:00:00.000Z",
  hasVoted: false,
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

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe("usePoll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch poll successfully", async () => {
    const poll = createTestPoll();

    getPollByIdMock.mockResolvedValueOnce(poll);

    const queryClient = createQueryClient();

    const { result } = renderHook(() => usePoll("poll-1"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getPollByIdMock).toHaveBeenCalledOnce();
    expect(getPollByIdMock).toHaveBeenCalledWith("poll-1");
    expect(result.current.data).toEqual(poll);
  });

  it("should expose error when fetching poll fails", async () => {
    const error = new Error("Failed to load poll");

    getPollByIdMock.mockRejectedValueOnce(error);

    const queryClient = createQueryClient();

    const { result } = renderHook(() => usePoll("poll-1"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });

  it("should not fetch poll when id is empty", async () => {
    const queryClient = createQueryClient();

    const { result } = renderHook(() => usePoll(""), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getPollByIdMock).not.toHaveBeenCalled();

    expect(queryClient.getQueryData(pollKeys.detail(""))).toBeUndefined();
  });
});

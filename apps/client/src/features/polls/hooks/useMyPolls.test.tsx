import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MyPollsResponse } from "../types/poll.types";
import { pollKeys } from "../types/poll.keys";
import { getMyPolls } from "../api/polls.api";
import { useMyPolls } from "./useMyPolls";

vi.mock("../api/polls.api", () => ({
  getMyPolls: vi.fn(),
}));

const getMyPollsMock = vi.mocked(getMyPolls);

const createTestPollsResponse = (): MyPollsResponse => ({
  polls: [
    {
      id: "poll-1",
      title: "First poll",
      description: "First description",
      isAnonymous: false,
      isMultipleChoice: false,
      expiresAt: "2026-12-01T12:00:00.000Z",
      options: [
        {
          id: "option-1",
          text: "Option 1",
          votesCount: 3,
        },
        {
          id: "option-2",
          text: "Option 2",
          votesCount: 2,
        },
      ],
    },
    {
      id: "poll-2",
      title: "Second poll",
      description: null,
      isAnonymous: true,
      isMultipleChoice: true,
      expiresAt: "2026-12-10T12:00:00.000Z",
      options: [
        {
          id: "option-3",
          text: "Option 3",
          votesCount: 5,
        },
        {
          id: "option-4",
          text: "Option 4",
          votesCount: 1,
        },
      ],
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

describe("useMyPolls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch user's polls successfully", async () => {
    const response = createTestPollsResponse();

    getMyPollsMock.mockResolvedValueOnce(response);

    const queryClient = createQueryClient();

    const { result } = renderHook(() => useMyPolls(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getMyPollsMock).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(response);
    expect(result.current.data?.polls).toHaveLength(2);
  });

  it("should return empty polls when user has no polls", async () => {
    const response: MyPollsResponse = {
      polls: [],
    };

    getMyPollsMock.mockResolvedValueOnce(response);

    const queryClient = createQueryClient();

    const { result } = renderHook(() => useMyPolls(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getMyPollsMock).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(response);
    expect(result.current.data?.polls).toHaveLength(0);
  });

  it("should expose error when fetching user's polls fails", async () => {
    const error = new Error("Failed to load polls");

    getMyPollsMock.mockRejectedValueOnce(error);

    const queryClient = createQueryClient();

    const { result } = renderHook(() => useMyPolls(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });

  it("should use the mine query key", async () => {
    const response = createTestPollsResponse();

    getMyPollsMock.mockResolvedValueOnce(response);

    const queryClient = createQueryClient();

    const { result } = renderHook(() => useMyPolls(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(queryClient.getQueryData(pollKeys.mine())).toEqual(response);
  });
});

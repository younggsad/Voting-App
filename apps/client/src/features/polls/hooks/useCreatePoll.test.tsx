import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Poll } from "../types";
import { pollKeys } from "../query/poll.keys";
import { useCreatePoll } from "./useCreatePoll";

import { createPoll } from "../api/polls.api";

vi.mock("../api/polls.api", () => ({
  createPoll: vi.fn(),
}));

const createPollMock = vi.mocked(createPoll);

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

const createWrapper = (queryClient: QueryClient) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe("useCreatePoll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a poll successfully", async () => {
    const poll = createTestPoll();

    createPollMock.mockResolvedValueOnce(poll);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    const { result } = renderHook(() => useCreatePoll(), {
      wrapper: createWrapper(queryClient),
    });

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

    result.current.mutate(request);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(createPollMock).toHaveBeenCalledOnce();
    expect(createPollMock).toHaveBeenCalledWith(
      request,
      expect.objectContaining({
        client: queryClient,
      })
    );

    expect(result.current.data).toEqual(poll);
  });

  it("should store created poll in query cache", async () => {
    const poll = createTestPoll();

    createPollMock.mockResolvedValueOnce(poll);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    const { result } = renderHook(() => useCreatePoll(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
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
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(queryClient.getQueryData(pollKeys.detail(poll.id))).toEqual(poll);
  });

  it("should expose mutation error", async () => {
    const error = new Error("Failed to create poll");

    createPollMock.mockRejectedValueOnce(error);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    const { result } = renderHook(() => useCreatePoll(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      title: "Test poll",
      description: "",
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
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });

  it("should expose pending state while creating a poll", async () => {
    let resolveMutation!: (poll: Poll) => void;

    createPollMock.mockImplementationOnce(
      () =>
        new Promise<Poll>((resolve) => {
          resolveMutation = resolve;
        })
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    const { result } = renderHook(() => useCreatePoll(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      title: "Test poll",
      description: "",
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
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    resolveMutation(createTestPoll());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Poll } from "../types";
import { usePollForm } from "./usePollForm";

import { createPoll } from "../api/polls.api";

const navigateMock = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

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

describe("usePollForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize form with default values", () => {
    const queryClient = createQueryClient();

    const { result } = renderHook(() => usePollForm(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.getValues()).toEqual({
      title: "",
      description: "",
      isAnonymous: false,
      isMultipleChoice: false,
      expiresAt: "",
      options: [{ text: "" }, { text: "" }],
    });
  });

  it("should create poll and navigate after successful submission", async () => {
    const poll = createTestPoll();

    createPollMock.mockResolvedValueOnce(poll);

    const queryClient = createQueryClient();

    const { result } = renderHook(() => usePollForm(), {
      wrapper: createWrapper(queryClient),
    });

    const formData = {
      title: "Test poll",
      description: "Test description",
      isAnonymous: false,
      isMultipleChoice: false,
      expiresAt: "2026-12-01T12:00:00",
      options: [{ text: "Option 1" }, { text: "Option 2" }],
    };

    result.current.onSubmit(formData);

    await waitFor(() => {
      expect(createPollMock).toHaveBeenCalledOnce();
    });

    const expectedRequest = {
      ...formData,
      expiresAt: new Date(formData.expiresAt).toISOString(),
    };

    expect(createPollMock.mock.calls[0][0]).toEqual(expectedRequest);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({
        to: "/poll/$id",
        params: {
          id: "poll-1",
        },
      });
    });
  });

  it("should expose error message when poll creation fails", async () => {
    const error = new Error("Failed to create poll");

    createPollMock.mockRejectedValueOnce(error);

    const queryClient = createQueryClient();

    const { result } = renderHook(() => usePollForm(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.onSubmit({
      title: "Test poll",
      description: "",
      isAnonymous: false,
      isMultipleChoice: false,
      expiresAt: "2026-12-01T12:00:00",
      options: [{ text: "Option 1" }, { text: "Option 2" }],
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.errorMessage).toBe("Failed to create poll.");
  });
});

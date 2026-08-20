import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PollPage } from "./PollPage";

import { usePoll } from "@/features/polls/hooks/usePoll";
import type { Poll } from "@/features/polls/types";

const useParamsMock = vi.fn();
const usePollMock = vi.mocked(usePoll);

vi.mock("@tanstack/react-router", () => ({
  useParams: () => useParamsMock(),
}));

vi.mock("@/features/polls/hooks/usePoll", () => ({
  usePoll: vi.fn(),
}));

vi.mock("@/features/polls/components/PollVoting", () => ({
  PollVoting: ({ poll }: { poll: Poll }) => (
    <div data-testid="poll-voting">Voting: {poll.title}</div>
  ),
}));

vi.mock("@/features/polls/components/PollResults", () => ({
  PollResults: ({ poll }: { poll: Poll }) => (
    <div data-testid="poll-results">Results: {poll.title}</div>
  ),
}));

vi.mock("@/shared/ui/Loading", () => ({
  Loading: () => <div data-testid="loading">Loading...</div>,
}));

vi.mock("@/shared/ui/ErrorMessage", () => ({
  ErrorMessage: ({ message }: { message: string }) => (
    <div data-testid="error-message">{message}</div>
  ),
}));

const createTestPoll = (hasVoted = false): Poll => ({
  id: "poll-1",
  title: "Test poll",
  description: "Test description",
  isAnonymous: false,
  isMultipleChoice: false,
  expiresAt: "2026-12-01T12:00:00.000Z",
  hasVoted,
  options: [
    {
      id: "option-1",
      text: "Option 1",
      votesCount: 10,
    },
    {
      id: "option-2",
      text: "Option 2",
      votesCount: 5,
    },
  ],
});

describe("PollPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useParamsMock.mockReturnValue({
      id: "poll-1",
    });
  });

  it("should show loading state while poll is loading", () => {
    usePollMock.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    } as ReturnType<typeof usePoll>);

    render(<PollPage />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("should show error message when poll loading fails", () => {
    const error = new Error("Failed to load poll");

    usePollMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error,
    } as ReturnType<typeof usePoll>);

    render(<PollPage />);

    expect(screen.getByTestId("error-message")).toHaveTextContent("Failed to load poll.");
  });

  it("should show voting UI when user has not voted", () => {
    const poll = createTestPoll(false);

    usePollMock.mockReturnValue({
      data: poll,
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof usePoll>);

    render(<PollPage />);

    expect(screen.getByTestId("poll-voting")).toHaveTextContent("Test poll");
    expect(screen.queryByTestId("poll-results")).not.toBeInTheDocument();
  });

  it("should show results UI when user has already voted", () => {
    const poll = createTestPoll(true);

    usePollMock.mockReturnValue({
      data: poll,
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof usePoll>);

    render(<PollPage />);

    expect(screen.getByTestId("poll-results")).toHaveTextContent("Test poll");
    expect(screen.queryByTestId("poll-voting")).not.toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Poll } from "../types";
import { PollVoting } from "./PollVoting";
import { ApiError } from "@/shared/api/api-error";

const mutateMock = vi.fn();

interface UseVoteMockResult {
  mutate: typeof mutateMock;
  isPending: boolean;
  isError: boolean;
  error: ApiError | null;
}

const useVoteMock = vi.fn<() => UseVoteMockResult>(() => ({
  mutate: mutateMock,
  isPending: false,
  isError: false,
  error: null,
}));

vi.mock("../hooks/useVote", () => ({
  useVote: () => useVoteMock(),
}));

const createPoll = (overrides: Partial<Poll> = {}): Poll => ({
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
  ...overrides,
});

describe("PollVoting", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useVoteMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  it("should render poll title, description and options", () => {
    render(<PollVoting poll={createPoll()} />);

    expect(screen.getByRole("heading", { name: "Test poll" })).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();

    expect(screen.getByLabelText("Option 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Option 2")).toBeInTheDocument();
  });

  it("should render radio buttons for single-choice poll", () => {
    render(<PollVoting poll={createPoll({ isMultipleChoice: false })} />);

    const option1 = screen.getByLabelText("Option 1");
    const option2 = screen.getByLabelText("Option 2");

    expect(option1).toHaveAttribute("type", "radio");
    expect(option2).toHaveAttribute("type", "radio");
  });

  it("should allow selecting only one option in single-choice poll", () => {
    render(<PollVoting poll={createPoll({ isMultipleChoice: false })} />);

    const option1 = screen.getByLabelText("Option 1");
    const option2 = screen.getByLabelText("Option 2");

    fireEvent.click(option1);

    expect(option1).toBeChecked();
    expect(option2).not.toBeChecked();

    fireEvent.click(option2);

    expect(option1).not.toBeChecked();
    expect(option2).toBeChecked();
  });

  it("should render checkboxes for multiple-choice poll", () => {
    render(<PollVoting poll={createPoll({ isMultipleChoice: true })} />);

    const option1 = screen.getByLabelText("Option 1");
    const option2 = screen.getByLabelText("Option 2");

    expect(option1).toHaveAttribute("type", "checkbox");
    expect(option2).toHaveAttribute("type", "checkbox");
  });

  it("should allow selecting multiple options", () => {
    render(<PollVoting poll={createPoll({ isMultipleChoice: true })} />);

    const option1 = screen.getByLabelText("Option 1");
    const option2 = screen.getByLabelText("Option 2");

    fireEvent.click(option1);
    fireEvent.click(option2);

    expect(option1).toBeChecked();
    expect(option2).toBeChecked();
  });

  it("should allow deselecting an option in multiple-choice poll", () => {
    render(<PollVoting poll={createPoll({ isMultipleChoice: true })} />);

    const option1 = screen.getByLabelText("Option 1");

    fireEvent.click(option1);

    expect(option1).toBeChecked();

    fireEvent.click(option1);

    expect(option1).not.toBeChecked();
  });

  it("should disable vote button when no option is selected", () => {
    render(<PollVoting poll={createPoll()} />);

    const button = screen.getByRole("button", { name: "Vote" });

    expect(button).toBeDisabled();
  });

  it("should enable vote button after selecting an option", () => {
    render(<PollVoting poll={createPoll()} />);

    const option1 = screen.getByLabelText("Option 1");
    const button = screen.getByRole("button", { name: "Vote" });

    fireEvent.click(option1);

    expect(button).toBeEnabled();
  });

  it("should submit selected option", () => {
    render(<PollVoting poll={createPoll()} />);

    fireEvent.click(screen.getByLabelText("Option 1"));
    fireEvent.click(screen.getByRole("button", { name: "Vote" }));

    expect(mutateMock).toHaveBeenCalledOnce();
    expect(mutateMock).toHaveBeenCalledWith(["option-1"]);
  });

  it("should submit multiple selected options", () => {
    render(<PollVoting poll={createPoll({ isMultipleChoice: true })} />);

    fireEvent.click(screen.getByLabelText("Option 1"));
    fireEvent.click(screen.getByLabelText("Option 2"));
    fireEvent.click(screen.getByRole("button", { name: "Vote" }));

    expect(mutateMock).toHaveBeenCalledOnce();
    expect(mutateMock).toHaveBeenCalledWith(["option-1", "option-2"]);
  });

  it("should not submit when no option is selected", () => {
    render(<PollVoting poll={createPoll()} />);

    fireEvent.click(screen.getByRole("button", { name: "Vote" }));

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("should disable inputs and button while voting", () => {
    useVoteMock.mockReturnValue({
      mutate: mutateMock,
      isPending: true,
      isError: false,
      error: null,
    });

    render(<PollVoting poll={createPoll()} />);

    expect(screen.getByLabelText("Option 1")).toBeDisabled();
    expect(screen.getByLabelText("Option 2")).toBeDisabled();

    const button = screen.getByRole("button", { name: "Voting..." });

    expect(button).toBeDisabled();
  });

  it("should show a known API error message when voting fails", () => {
    useVoteMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isError: true,
      error: new ApiError(409, "Already voted", "ALREADY_VOTED"),
    });

    render(<PollVoting poll={createPoll()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("You have already voted in this poll.");
  });

  it("should show fallback error message for unknown voting error", () => {
    useVoteMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isError: true,
      error: null,
    });

    render(<PollVoting poll={createPoll()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Failed to submit vote. Please try again.");
  });

  it("should not render description when it is empty", () => {
    render(<PollVoting poll={createPoll({ description: "" })} />);

    expect(screen.queryByText("Test description")).not.toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Poll } from "../types";
import { PollResults } from "./PollResults";

const createPoll = (overrides: Partial<Poll> = {}): Poll => ({
  id: "poll-1",
  title: "Test poll",
  description: "Test description",
  isAnonymous: false,
  isMultipleChoice: false,
  expiresAt: "2026-12-01T12:00:00.000Z",
  hasVoted: true,
  options: [
    {
      id: "option-1",
      text: "Option 1",
      votesCount: 5,
    },
    {
      id: "option-2",
      text: "Option 2",
      votesCount: 3,
    },
  ],
  ...overrides,
});

describe("PollResults", () => {
  it("should render poll title and description", () => {
    render(<PollResults poll={createPoll()} />);

    expect(screen.getByRole("heading", { name: "Test poll" })).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("should render all poll options", () => {
    render(<PollResults poll={createPoll()} />);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("should render vote counts for all options", () => {
    render(<PollResults poll={createPoll()} />);

    expect(screen.getByText("5 votes")).toBeInTheDocument();
    expect(screen.getByText("3 votes")).toBeInTheDocument();
  });

  it("should not render description when it is empty", () => {
    render(<PollResults poll={createPoll({ description: "" })} />);

    expect(screen.queryByText("Test description")).not.toBeInTheDocument();
  });

  it("should render zero votes correctly", () => {
    render(
      <PollResults
        poll={createPoll({
          options: [
            {
              id: "option-1",
              text: "Option 1",
              votesCount: 0,
            },
          ],
        })}
      />
    );

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("0 votes")).toBeInTheDocument();
  });
});

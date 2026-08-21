import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CreatePollPage } from "./CreatePollPage";

vi.mock("@/features/polls/components/PollForm", () => ({
  PollForm: () => <div data-testid="poll-form">Poll form</div>,
}));

describe("CreatePollPage", () => {
  it("should render the page heading and description", () => {
    render(<CreatePollPage />);

    expect(
      screen.getByRole("heading", {
        name: "Create a poll",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ask a question, add your options, and start collecting votes.")
    ).toBeInTheDocument();
  });

  it("should render the poll form", () => {
    render(<CreatePollPage />);

    expect(screen.getByTestId("poll-form")).toBeInTheDocument();
  });
});

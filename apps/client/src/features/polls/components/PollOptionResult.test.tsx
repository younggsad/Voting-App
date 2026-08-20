import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { PollOption } from "../types";
import { PollOptionResult } from "./PollOptionResult";

const createOption = (overrides: Partial<PollOption> = {}): PollOption => ({
  id: "option-1",
  text: "Option 1",
  votesCount: 5,
  ...overrides,
});

describe("PollOptionResult", () => {
  it("should render option text", () => {
    render(<PollOptionResult option={createOption()} />);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("should render vote count", () => {
    render(<PollOptionResult option={createOption({ votesCount: 5 })} />);

    expect(screen.getByText("5 votes")).toBeInTheDocument();
  });

  it("should render zero votes correctly", () => {
    render(<PollOptionResult option={createOption({ votesCount: 0 })} />);

    expect(screen.getByText("0 votes")).toBeInTheDocument();
  });

  it("should render large vote counts correctly", () => {
    render(<PollOptionResult option={createOption({ votesCount: 1000 })} />);

    expect(screen.getByText("1000 votes")).toBeInTheDocument();
  });
});

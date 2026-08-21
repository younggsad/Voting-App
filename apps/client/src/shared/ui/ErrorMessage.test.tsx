import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage", () => {
  it("should render error message", () => {
    render(<ErrorMessage message="Something went wrong." />);

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong.");
  });

  it("should render alert role", () => {
    render(<ErrorMessage message="Failed to load poll." />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

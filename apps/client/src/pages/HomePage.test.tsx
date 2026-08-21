import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomePage } from "./HomePage";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe("HomePage", () => {
  it("should render the hero section", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: "Create polls. Share your question. Get answers.",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Create simple polls and collect votes in real time. No account required to get started."
      )
    ).toBeInTheDocument();
  });

  it("should provide a link to create a poll", () => {
    render(<HomePage />);

    const link = screen.getByRole("link", {
      name: "Create a poll",
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/create");
  });

  it("should render all feature sections", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "Simple polls" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Flexible voting" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Live results" })).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import type { PollFormValues } from "../schemas/poll.schema";
import { PollSettings } from "./PollSettings";

const registerMock = vi.fn((name: string) => ({
  name,
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
}));

const renderPollSettings = (errors: FieldErrors<PollFormValues> = {}) => {
  render(
    <PollSettings
      register={registerMock as unknown as UseFormRegister<PollFormValues>}
      errors={errors}
    />
  );
};

describe("PollSettings", () => {
  it("should render settings section", () => {
    renderPollSettings();

    expect(screen.getByRole("heading", { name: "Poll settings" })).toBeInTheDocument();
  });

  it("should render description field", () => {
    renderPollSettings();

    const description = screen.getByLabelText("Description");

    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute("id", "description");
  });

  it("should render expiresAt field", () => {
    renderPollSettings();

    const expiresAt = screen.getByLabelText("Expires at");

    expect(expiresAt).toBeInTheDocument();
    expect(expiresAt).toHaveAttribute("type", "datetime-local");
    expect(expiresAt).toHaveAttribute("id", "expiresAt");
  });

  it("should render anonymous voting checkbox", () => {
    renderPollSettings();

    const checkbox = screen.getByRole("checkbox", {
      name: "Anonymous voting",
    });

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("should render multiple choice checkbox", () => {
    renderPollSettings();

    const checkbox = screen.getByRole("checkbox", {
      name: "Multiple choice",
    });

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("should allow changing anonymous voting", () => {
    renderPollSettings();

    const checkbox = screen.getByRole("checkbox", {
      name: "Anonymous voting",
    });

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("should allow changing multiple choice", () => {
    renderPollSettings();

    const checkbox = screen.getByRole("checkbox", {
      name: "Multiple choice",
    });

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("should render description validation error", () => {
    renderPollSettings({
      description: {
        type: "required",
        message: "Description is too long",
      },
    });

    expect(screen.getByText("Description is too long")).toBeInTheDocument();
  });

  it("should render expiresAt validation error", () => {
    renderPollSettings({
      expiresAt: {
        type: "required",
        message: "Expiration date is required",
      },
    });

    expect(screen.getByText("Expiration date is required")).toBeInTheDocument();
  });

  it("should not render validation errors when there are no errors", () => {
    renderPollSettings();

    expect(screen.queryByText("Description is too long")).not.toBeInTheDocument();
    expect(screen.queryByText("Expiration date is required")).not.toBeInTheDocument();
  });

  it("should register all form fields", () => {
    renderPollSettings();

    expect(registerMock).toHaveBeenCalledWith("description");
    expect(registerMock).toHaveBeenCalledWith("expiresAt");
    expect(registerMock).toHaveBeenCalledWith("isAnonymous");
    expect(registerMock).toHaveBeenCalledWith("isMultipleChoice");
  });
});

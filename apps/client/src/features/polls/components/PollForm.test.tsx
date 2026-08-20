import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PollForm } from "./PollForm";

const handleSubmitMock = vi.fn();
const onSubmitMock = vi.fn();
const appendMock = vi.fn();
const removeMock = vi.fn();

const registerMock = vi.fn((name: string) => ({
  name,
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
}));

interface UsePollFormMockResult {
  register: typeof registerMock;
  handleSubmit: typeof handleSubmitMock;
  errors: Record<string, never>;
  fields: Array<{
    id: string;
  }>;
  append: typeof appendMock;
  remove: typeof removeMock;
  onSubmit: typeof onSubmitMock;
  isPending: boolean;
  errorMessage: string | null;
}

const usePollFormMock = vi.fn<() => UsePollFormMockResult>(() => ({
  register: registerMock,
  handleSubmit: handleSubmitMock,
  errors: {},
  fields: [
    {
      id: "field-1",
    },
    {
      id: "field-2",
    },
  ],
  append: appendMock,
  remove: removeMock,
  onSubmit: onSubmitMock,
  isPending: false,
  errorMessage: null,
}));

vi.mock("../hooks/usePollForm", () => ({
  usePollForm: () => usePollFormMock(),
}));

describe("PollForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    handleSubmitMock.mockImplementation((callback) => callback);

    usePollFormMock.mockReturnValue({
      register: registerMock,
      handleSubmit: handleSubmitMock,
      errors: {},
      fields: [
        {
          id: "field-1",
        },
        {
          id: "field-2",
        },
      ],
      append: appendMock,
      remove: removeMock,
      onSubmit: onSubmitMock,
      isPending: false,
      errorMessage: null,
    });
  });

  it("should render the form", () => {
    render(<PollForm />);

    expect(screen.getByRole("heading", { name: "Create poll" })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Create poll" })).toBeInTheDocument();
  });

  it("should render title field", () => {
    render(<PollForm />);

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
  });

  it("should render poll settings", () => {
    render(<PollForm />);

    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Expires at")).toBeInTheDocument();

    expect(screen.getByLabelText("Anonymous voting")).toBeInTheDocument();
    expect(screen.getByLabelText("Multiple choice")).toBeInTheDocument();
  });

  it("should render poll options", () => {
    render(<PollForm />);

    expect(screen.getByText("Options")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Add option" })).toBeInTheDocument();
  });

  it("should disable submit button while creating poll", () => {
    usePollFormMock.mockReturnValue({
      register: registerMock,
      handleSubmit: handleSubmitMock,
      errors: {},
      fields: [
        {
          id: "field-1",
        },
        {
          id: "field-2",
        },
      ],
      append: appendMock,
      remove: removeMock,
      onSubmit: onSubmitMock,
      isPending: true,
      errorMessage: null,
    });

    render(<PollForm />);

    const button = screen.getByRole("button", { name: "Creating..." });

    expect(button).toBeDisabled();
  });

  it("should show error message when poll creation fails", () => {
    usePollFormMock.mockReturnValue({
      register: registerMock,
      handleSubmit: handleSubmitMock,
      errors: {},
      fields: [
        {
          id: "field-1",
        },
        {
          id: "field-2",
        },
      ],
      append: appendMock,
      remove: removeMock,
      onSubmit: onSubmitMock,
      isPending: false,
      errorMessage: "Failed to create poll",
    });

    render(<PollForm />);

    expect(screen.getByRole("alert")).toHaveTextContent("Failed to create poll");
  });

  it("should not show error message when there is no error", () => {
    render(<PollForm />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("should call handleSubmit when form is submitted", () => {
    render(<PollForm />);

    const form = screen
      .getByRole("button", {
        name: "Create poll",
      })
      .closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(handleSubmitMock).toHaveBeenCalled();
  });
});

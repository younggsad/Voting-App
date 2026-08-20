import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import type { FieldError } from "react-hook-form";

import type { PollFormValues } from "../schemas/poll.schema";
import { PollOptionField } from "./PollOptionField";

const TestWrapper = ({
  index = 0,
  error,
  canRemove = true,
  onRemove = vi.fn(),
}: {
  index?: number;
  error?: FieldError;
  canRemove?: boolean;
  onRemove?: () => void;
}) => {
  const { register } = useForm<PollFormValues>();

  return (
    <PollOptionField
      index={index}
      register={register}
      error={error}
      canRemove={canRemove}
      onRemove={onRemove}
    />
  );
};

describe("PollOptionField", () => {
  it("should render option label and input", () => {
    render(<TestWrapper index={0} />);

    expect(screen.getByLabelText("Option 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Option 1")).toHaveAttribute("id", "option-0");
  });

  it("should render correct label for different index", () => {
    render(<TestWrapper index={2} />);

    expect(screen.getByLabelText("Option 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Option 3")).toHaveAttribute("id", "option-2");
  });

  it("should render remove button", () => {
    render(<TestWrapper />);

    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("should enable remove button when option can be removed", () => {
    render(<TestWrapper canRemove />);

    expect(screen.getByRole("button", { name: "Remove" })).toBeEnabled();
  });

  it("should disable remove button when option cannot be removed", () => {
    render(<TestWrapper canRemove={false} />);

    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled();
  });

  it("should call onRemove when remove button is clicked", () => {
    const onRemove = vi.fn();

    render(<TestWrapper onRemove={onRemove} />);

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("should render validation error", () => {
    render(
      <TestWrapper
        error={{
          type: "required",
          message: "Option is required",
        }}
      />
    );

    expect(screen.getByText("Option is required")).toBeInTheDocument();
  });

  it("should not render validation error when there is no error", () => {
    render(<TestWrapper />);

    expect(screen.queryByText("Option is required")).not.toBeInTheDocument();
  });
});

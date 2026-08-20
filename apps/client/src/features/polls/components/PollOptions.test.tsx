import { fireEvent, render, screen } from "@testing-library/react";
import type { FieldArrayWithId, FieldErrors } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import type { PollFormValues } from "../schemas/poll.schema";
import { PollOptions } from "./PollOptions";

const createFields = (count: number): FieldArrayWithId<PollFormValues, "options", "id">[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `field-${index}`,
    text: "",
  }));

interface RenderPollOptionsParams {
  count?: number;
  errors?: FieldErrors<PollFormValues>;
  append?: (value: { text: string }) => void;
  remove?: (index: number) => void;
}

const renderPollOptions = ({
  count = 2,
  errors = {},
  append = vi.fn(),
  remove = vi.fn(),
}: RenderPollOptionsParams = {}) => {
  const fields = createFields(count);

  render(
    <PollOptions
      fields={fields}
      register={vi.fn() as never}
      append={append}
      remove={remove}
      errors={errors}
    />
  );

  return {
    append,
    remove,
  };
};

describe("PollOptions", () => {
  it("should render all option fields", () => {
    renderPollOptions({ count: 3 });

    expect(screen.getByLabelText("Option 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Option 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Option 3")).toBeInTheDocument();
  });

  it("should render Add option button", () => {
    renderPollOptions();

    expect(screen.getByRole("button", { name: "Add option" })).toBeInTheDocument();
  });

  it("should append an empty option when Add option is clicked", () => {
    const append = vi.fn();

    renderPollOptions({ append });

    fireEvent.click(screen.getByRole("button", { name: "Add option" }));

    expect(append).toHaveBeenCalledOnce();
    expect(append).toHaveBeenCalledWith({
      text: "",
    });
  });

  it("should disable Remove buttons when there are only two options", () => {
    renderPollOptions({ count: 2 });

    const removeButtons = screen.getAllByRole("button", {
      name: "Remove",
    });

    expect(removeButtons).toHaveLength(2);

    removeButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("should enable Remove buttons when there are more than two options", () => {
    renderPollOptions({ count: 3 });

    const removeButtons = screen.getAllByRole("button", {
      name: "Remove",
    });

    expect(removeButtons).toHaveLength(3);

    removeButtons.forEach((button) => {
      expect(button).toBeEnabled();
    });
  });

  it("should remove the correct option", () => {
    const remove = vi.fn();

    renderPollOptions({
      count: 3,
      remove,
    });

    const removeButtons = screen.getAllByRole("button", {
      name: "Remove",
    });

    fireEvent.click(removeButtons[1]);

    expect(remove).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledWith(1);
  });

  it("should render array validation error", () => {
    renderPollOptions({
      errors: {
        options: {
          message: "At least two options are required",
        },
      },
    });

    expect(screen.getByText("At least two options are required")).toBeInTheDocument();
  });

  it("should render field validation errors", () => {
    renderPollOptions({
      count: 2,
      errors: {
        options: [
          {
            text: {
              type: "required",
              message: "Option 1 is required",
            },
          },
          {
            text: {
              type: "required",
              message: "Option 2 is required",
            },
          },
        ],
      },
    });

    expect(screen.getByText("Option 1 is required")).toBeInTheDocument();
    expect(screen.getByText("Option 2 is required")).toBeInTheDocument();
  });
});

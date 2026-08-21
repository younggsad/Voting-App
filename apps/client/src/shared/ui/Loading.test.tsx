import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Loading } from "./Loading";

describe("Loading", () => {
  it("should render loading message", () => {
    render(<Loading />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading...");
  });
});

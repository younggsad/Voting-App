import { describe, expect, it } from "vitest";

import { ApiError } from "./api-error";
import { getApiErrorMessage } from "./api-error-message";

describe("getApiErrorMessage", () => {
  it("should return message for already voted error", () => {
    const error = new ApiError(409, "You have already voted in this poll", "ALREADY_VOTED");

    expect(getApiErrorMessage(error)).toBe("You have already voted in this poll.");
  });

  it("should return message for poll not found error", () => {
    const error = new ApiError(404, "Poll not found", "POLL_NOT_FOUND");

    expect(getApiErrorMessage(error)).toBe("Poll not found.");
  });

  it("should return message for expired poll", () => {
    const error = new ApiError(400, "Poll has expired", "VOTE_NOT_ALLOWED");

    expect(getApiErrorMessage(error)).toBe("Voting is no longer available for this poll.");
  });

  it("should return network error message", () => {
    const error = new ApiError(0, "Unable to connect to the server", "NETWORK_ERROR");

    expect(getApiErrorMessage(error)).toBe(
      "Unable to connect to the server. Please check your connection."
    );
  });

  it("should return fallback for unknown error", () => {
    const error = new Error("Unknown error");

    expect(getApiErrorMessage(error, "Fallback message")).toBe("Fallback message");
  });
});

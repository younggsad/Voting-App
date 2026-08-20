import axios from "axios";
import { describe, expect, it } from "vitest";

import { ApiError, normalizeApiError } from "./api-error";

describe("normalizeApiError", () => {
  it("should normalize an Axios API error", () => {
    const axiosError = new axios.AxiosError("Request failed", "ERR_BAD_REQUEST");

    axiosError.response = {
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: {
        headers: new axios.AxiosHeaders(),
      },
      data: {
        code: "ALREADY_VOTED",
        message: "You have already voted.",
      },
    };

    const result = normalizeApiError(axiosError);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.status).toBe(409);
    expect(result.code).toBe("ALREADY_VOTED");
    expect(result.message).toBe("You have already voted.");
  });

  it("should normalize an Axios network error", () => {
    const axiosError = new axios.AxiosError("Network Error", "ERR_NETWORK");

    const result = normalizeApiError(axiosError);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.status).toBe(0);
    expect(result.code).toBe("NETWORK_ERROR");
    expect(result.message).toBe("Unable to connect to the server");
  });

  it("should normalize a regular Error", () => {
    const error = new Error("Something went wrong");

    const result = normalizeApiError(error);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.status).toBe(500);
    expect(result.message).toBe("Something went wrong");
    expect(result.code).toBeUndefined();
  });

  it("should return a fallback ApiError for an unknown error", () => {
    const result = normalizeApiError("unexpected error");

    expect(result).toBeInstanceOf(ApiError);
    expect(result.status).toBe(500);
    expect(result.message).toBe("Something went wrong");
    expect(result.code).toBeUndefined();
  });
});

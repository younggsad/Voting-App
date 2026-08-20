import axios, { type AxiosInstance } from "axios";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "./api-error";

describe("api client", () => {
  const createSpy = vi.spyOn(axios, "create");

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    vi.stubEnv("VITE_API_URL", "http://localhost:4000");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should create Axios instance with correct configuration", async () => {
    const useMock = vi.fn();

    createSpy.mockReturnValueOnce({
      interceptors: {
        response: {
          use: useMock,
        },
      },
    } as never);

    await import("./client");

    expect(createSpy).toHaveBeenCalledWith({
      baseURL: "http://localhost:4000",
      timeout: 10000,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("should register response interceptor", async () => {
    const useMock = vi.fn();

    createSpy.mockReturnValueOnce({
      interceptors: {
        response: {
          use: useMock,
        },
      },
    } as never);

    await import("./client");

    expect(useMock).toHaveBeenCalledOnce();
  });

  it("should pass successful response through interceptor", async () => {
    type TestResponse = {
      data: {
        id: string;
        title: string;
      };
    };

    const response: TestResponse = {
      data: {
        id: "poll-1",
        title: "Test poll",
      },
    };

    let successHandler!: (value: TestResponse) => TestResponse;

    const useMock = vi.fn((success: (value: TestResponse) => TestResponse) => {
      successHandler = success;
    });

    createSpy.mockReturnValueOnce({
      interceptors: {
        response: {
          use: useMock,
        },
      },
    } as never);

    await import("./client");

    expect(successHandler(response)).toBe(response);
  });

  it("should normalize response error", async () => {
    const useMock = vi.fn();

    vi.mocked(axios.create).mockReturnValueOnce({
      interceptors: {
        response: {
          use: useMock,
        },
      },
    } as unknown as AxiosInstance);

    await import("./client");

    const [, errorHandler] = useMock.mock.calls[0];

    const error = new Error("Request failed");

    await expect(errorHandler(error)).rejects.toEqual(new ApiError(500, "Request failed"));
  });
});

import axios from "axios";

interface ApiErrorResponse {
  code?: string;
  message?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const normalizeApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return new ApiError(0, "Unable to connect to the server", "NETWORK_ERROR");
    }

    return new ApiError(
      error.response.status,
      error.response.data?.message ?? "Something went wrong",
      error.response.data?.code
    );
  }

  if (error instanceof Error) {
    return new ApiError(500, error.message);
  }

  return new ApiError(500, "Something went wrong");
};

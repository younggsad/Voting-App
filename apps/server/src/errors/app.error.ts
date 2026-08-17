import type { ErrorCode } from "./codes";

export class AppError extends Error {
  public readonly isOperational = true;

  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    public readonly details?: unknown
  ) {
    super(message);

    this.name = "AppError";

    Error.captureStackTrace(this, this.constructor);
  }
}

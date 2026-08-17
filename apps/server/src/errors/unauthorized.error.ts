import { AppError } from "./app.error";
import { ERROR_CODES, type ErrorCode } from "./codes";

export class UnauthorizedError extends AppError {
  constructor(
    message = "Unauthorized",
    details?: unknown,
    code: ErrorCode = ERROR_CODES.SESSION_REQUIRED
  ) {
    super(message, 401, code, details);
  }
}

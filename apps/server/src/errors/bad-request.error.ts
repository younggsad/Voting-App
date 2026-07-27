import { AppError } from "./app.error";
import { ERROR_CODES, type ErrorCode } from "./codes";

// Ошибка некорректных входных данных (HTTP 400)
export class BadRequestError extends AppError {
  constructor(
    message = "Bad request",
    details?: unknown,
    code: ErrorCode = ERROR_CODES.BAD_REQUEST
  ) {
    super(message, 400, code, details);
  }
}

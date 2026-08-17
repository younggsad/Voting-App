import { AppError } from "./app.error";
import { ERROR_CODES, type ErrorCode } from "./codes";

// Ошибка конфликта данных (HTTP 409)
export class ConflictError extends AppError {
  constructor(message = "Conflict", code: ErrorCode = ERROR_CODES.CONFLICT, details?: unknown) {
    super(message, 409, code, details);
  }
}

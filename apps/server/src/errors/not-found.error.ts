import { AppError } from "./app.error";
import { ERROR_CODES, type ErrorCode } from "./codes";

// Ошибка отсутствующего ресурса (HTTP 404)
export class NotFoundError extends AppError {
  constructor(
    message = "Resource not found",
    details?: unknown,
    code: ErrorCode = ERROR_CODES.RESOURCE_NOT_FOUND
  ) {
    super(message, 404, code, details);
  }
}

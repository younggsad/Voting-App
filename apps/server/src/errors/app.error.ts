import type { ErrorCode } from "./codes";

export class AppError extends Error {
  // Ошибка ожидаемая и обработанная приложением
  public readonly isOperational = true;

  constructor(
    message: string,

    // HTTP статус ошибки
    public readonly statusCode: number,

    // Код ошибки для клиента
    public readonly code: ErrorCode,

    // Дополнительные данные ошибки
    public readonly details?: unknown
  ) {
    super(message);

    Error.captureStackTrace(this, this.constructor);
  }
}

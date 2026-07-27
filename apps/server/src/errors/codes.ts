// Все коды ошибок API.
// Клиент использует их вместо анализа текста message.

export const ERROR_CODES = {
  // Общие ошибки
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

  // Poll
  POLL_NOT_FOUND: "POLL_NOT_FOUND",

  // Vote
  VOTE_NOT_ALLOWED: "VOTE_NOT_ALLOWED",
  ALREADY_VOTED: "ALREADY_VOTED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-session" : "session";

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

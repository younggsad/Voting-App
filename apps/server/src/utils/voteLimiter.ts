import rateLimit from "express-rate-limit";

export const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many vote attempts, please try again later",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

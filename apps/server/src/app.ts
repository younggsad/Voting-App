import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { NotFoundError } from "@/errors/not-found.error";

import pollRoutes from "@/routes/poll.routes";
import voteRoutes from "@/routes/vote.routes";

import { errorMiddleware } from "@/middlewares/error.middleware";

export const app = express();

// --------------------------------------------------
// Security
// --------------------------------------------------

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  })
);

// --------------------------------------------------
// Request parsing
// --------------------------------------------------

app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(cookieParser());

// --------------------------------------------------
// Rate limiting
// --------------------------------------------------

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

// --------------------------------------------------
// Health / root
// --------------------------------------------------

app.get("/", (_req, res) => {
  res.send("Server is running");
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// --------------------------------------------------
// API
// --------------------------------------------------

app.use("/polls", apiLimiter);
app.use("/polls", pollRoutes);
app.use("/polls", voteRoutes);

// --------------------------------------------------
// 404
// --------------------------------------------------

app.use((_req, _res, next) => {
  next(new NotFoundError("Route not found"));
});

// --------------------------------------------------
// Error handling
// --------------------------------------------------

app.use(errorMiddleware);

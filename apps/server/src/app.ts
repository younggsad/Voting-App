import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { NotFoundError } from "@/errors/not-found.error";
import { errorMiddleware } from "@/middlewares/error.middleware";
import pollRoutes from "@/routes/poll.routes";
import voteRoutes from "@/routes/vote.routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.send("Server is running");
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/polls", pollRoutes);
app.use("/polls", voteRoutes);

// Обработка неизвестных маршрутов
app.use((_req, _res, next) => {
  next(new NotFoundError("Route not found"));
});

// Централизованный обработчик ошибок
app.use(errorMiddleware);

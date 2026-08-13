import cors from "cors";
import express from "express";
import helmet from "helmet";

import pollRoutes from "@/routes/poll.routes";
import voteRoutes from "@/routes/vote.routes";
import { errorMiddleware } from "@/middlewares/error.middleware";
import { NotFoundError } from "@/errors/not-found.error";

export const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

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

// Обработка неизвестных маршрутов
app.use((_req, _res, next) => {
  next(new NotFoundError("Route not found"));
});

// Централизованный обработчик ошибок
app.use(errorMiddleware);

app.use("/polls", voteRoutes);

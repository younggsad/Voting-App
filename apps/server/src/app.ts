import cors from "cors";
import express from "express";
import pollRoutes from "@/routes/poll.routes";
import { errorMiddleware } from "@/middlewares/error.middleware";

export const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Server is running");
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/polls", pollRoutes);
app.use(errorMiddleware);

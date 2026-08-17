import type { NextFunction, Request, Response } from "express";

import { AppError } from "@/errors/app.error";
import { ERROR_CODES } from "@/errors/codes";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      details: err.details,
    });

    return;
  }

  console.error(err);

  res.status(500).json({
    message: "Internal server error",
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
  });
};

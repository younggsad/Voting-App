import { AppError } from "@/errors/app.error";
import type { NextFunction, Request, Response } from "express";
import type { ZodObject } from "zod";

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

export const validate =
  <T extends ZodObject>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new BadRequestError(JSON.stringify(result.error.issues));
    }

    req.body = result.data;

    next();
  };

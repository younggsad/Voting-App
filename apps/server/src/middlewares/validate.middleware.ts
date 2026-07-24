import type { NextFunction, Request, Response } from "express";
import type { ZodObject, ZodRawShape } from "zod";

import { ERROR_CODES } from "@/errors/codes";
import { BadRequestError } from "@/errors/bad-request.error";

export const validate =
  <T extends ZodObject<ZodRawShape>>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new BadRequestError(
        "Validation failed",
        result.error.issues,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    req.body = result.data;

    return next();
  };

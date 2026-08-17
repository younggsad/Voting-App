import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

import { BadRequestError } from "@/errors/bad-request.error";
import { ERROR_CODES } from "@/errors/codes";

export const validate =
  (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new BadRequestError("Validation failed", result.error.issues, ERROR_CODES.VALIDATION_ERROR)
      );

      return;
    }

    // Replace the untrusted request body with validated data.
    req.body = result.data;

    next();
  };

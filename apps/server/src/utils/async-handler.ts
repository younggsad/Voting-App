import type { NextFunction, Request, RequestHandler, Response } from "express";

// Тип асинхронного контроллера с поддержкой любых типов Request
type AsyncController<T extends Request = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler =
  <T extends Request = Request>(controller: AsyncController<T>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(controller(req as T, res, next)).catch(next);
  };

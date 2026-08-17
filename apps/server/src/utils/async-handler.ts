import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncController<T extends Request = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Передаёт ошибки async-контроллеров в централизованный error middleware.
export const asyncHandler =
  <T extends Request = Request>(controller: AsyncController<T>): RequestHandler =>
  (req, res, next) => {
    controller(req as T, res, next).catch(next);
  };

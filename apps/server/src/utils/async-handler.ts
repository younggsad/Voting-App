import type { NextFunction, Request, Response } from "express";

export type AsyncController<TRequest extends Request = Request> = (
  req: TRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler =
  <TRequest extends Request>(controller: AsyncController<TRequest>) =>
  (req: TRequest, res: Response, next: NextFunction): void => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };

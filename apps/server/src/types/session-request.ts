import type { Request } from "express";

export type SessionRequest<Params = Record<string, string>, Body = unknown> = Request<
  Params,
  unknown,
  Body
> & {
  sessionId: string;
};

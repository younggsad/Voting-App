import "@testing-library/jest-dom/vitest";

import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./handlers/server";
import { resetPollState } from "./handlers/polls.handlers";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
  resetPollState();
});

afterAll(() => {
  server.close();
});

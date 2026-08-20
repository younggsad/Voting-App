import { setupServer } from "msw/node";

import { pollsHandlers } from "./polls.handlers";

export const server = setupServer(...pollsHandlers);

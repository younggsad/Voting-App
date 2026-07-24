import { expect, it } from "vitest";

import { createPollSchema } from "./poll.validator";

it("should validate correct poll", () => {
  const result = createPollSchema.safeParse({
    title: "Test",
    description: "",
    isAnonymous: false,
    isMultipleChoice: false,
    expiresAt: new Date(Date.now() + 100000).toISOString(),

    options: [
      {
        text: "Yes",
      },
      {
        text: "No",
      },
    ],
  });

  expect(result.success).toBe(true);
});

it("should require at least two options", () => {
  const result = createPollSchema.safeParse({
    title: "Test",
    isAnonymous: false,
    isMultipleChoice: false,
    expiresAt: new Date(Date.now() + 100000).toISOString(),

    options: [
      {
        text: "Yes",
      },
    ],
  });

  expect(result.success).toBe(false);
});

it("should reject duplicated options", () => {
  const result = createPollSchema.safeParse({
    title: "Test",
    isAnonymous: false,
    isMultipleChoice: false,
    expiresAt: new Date(Date.now() + 100000).toISOString(),

    options: [
      {
        text: "Yes",
      },
      {
        text: "Yes",
      },
    ],
  });

  expect(result.success).toBe(false);
});

it("should reject past expiration date", () => {
  const result = createPollSchema.safeParse({
    title: "Test",
    isAnonymous: false,
    isMultipleChoice: false,
    expiresAt: "2020-01-01T00:00:00.000Z",

    options: [
      {
        text: "Yes",
      },
      {
        text: "No",
      },
    ],
  });

  expect(result.success).toBe(false);
});

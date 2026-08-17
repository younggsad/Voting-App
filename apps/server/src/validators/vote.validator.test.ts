import { expect, it } from "vitest";

import { voteSchema } from "./vote.validator";

it("should validate correct vote", () => {
  const result = voteSchema.safeParse({
    optionIds: ["550e8400-e29b-41d4-a716-446655440000"],
  });

  expect(result.success).toBe(true);
});

it("should require at least one option", () => {
  const result = voteSchema.safeParse({
    optionIds: [],
  });

  expect(result.success).toBe(false);
});

it("should reject invalid option id", () => {
  const result = voteSchema.safeParse({
    optionIds: ["invalid-id"],
  });

  expect(result.success).toBe(false);
});

it("should reject duplicated options", () => {
  const optionId = "550e8400-e29b-41d4-a716-446655440000";

  const result = voteSchema.safeParse({
    optionIds: [optionId, optionId],
  });

  expect(result.success).toBe(false);
});

it("should accept multiple unique options", () => {
  const result = voteSchema.safeParse({
    optionIds: ["550e8400-e29b-41d4-a716-446655440000", "6ba7b810-9dad-41d1-80b4-00c04fd430c8"],
  });

  expect(result.success).toBe(true);
});

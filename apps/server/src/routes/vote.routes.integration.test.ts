import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { app } from "@/app";
import { prisma } from "@/lib/prisma";

describe("Vote API integration", () => {
  let pollId: string;
  let optionId: string;

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.voteOption.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.session.deleteMany();
    await prisma.option.deleteMany();
    await prisma.poll.deleteMany();

    const poll = await prisma.poll.create({
      data: {
        title: "Integration vote poll",
        description: "Created by integration test",
        isAnonymous: false,
        isMultipleChoice: false,
        expiresAt: new Date("2026-12-01T12:00:00.000Z"),
        options: {
          create: [
            {
              text: "Option 1",
              position: 0,
            },
            {
              text: "Option 2",
              position: 1,
            },
          ],
        },
      },
      include: {
        options: true,
      },
    });

    pollId = poll.id;
    optionId = poll.options[0].id;
  });

  afterAll(async () => {
    await prisma.voteOption.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.session.deleteMany();
    await prisma.option.deleteMany();
    await prisma.poll.deleteMany();

    await prisma.$disconnect();
  });

  describe("POST /polls/:id/vote", () => {
    it("should create a vote", async () => {
      const response = await request(app)
        .post(`/polls/${pollId}/vote`)
        .send({
          optionIds: [optionId],
        });

      expect(response.status).toBe(201);

      expect(response.body).toMatchObject({
        pollId,
        optionIds: [optionId],
      });

      expect(response.body.id).toEqual(expect.any(String));
      expect(response.body.sessionId).toEqual(expect.any(String));
      expect(response.body.createdAt).toEqual(expect.any(String));

      const vote = await prisma.vote.findUnique({
        where: {
          id: response.body.id,
        },
        include: {
          options: true,
        },
      });

      expect(vote).not.toBeNull();
      expect(vote?.pollId).toBe(pollId);
      expect(vote?.sessionId).toBe(response.body.sessionId);
      expect(vote?.options).toHaveLength(1);
      expect(vote?.options[0].optionId).toBe(optionId);
    });

    it("should return 404 for an option that does not belong to the poll", async () => {
      const invalidOptionId = "550e8400-e29b-41d4-a716-446655440000";

      const response = await request(app)
        .post(`/polls/${pollId}/vote`)
        .send({
          optionIds: [invalidOptionId],
        });

      expect(response.status).toBe(404);

      expect(response.body).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
      });

      const votes = await prisma.vote.count({
        where: {
          pollId,
        },
      });

      expect(votes).toBe(0);
    });

    it("should reject duplicate vote", async () => {
      const agent = request.agent(app);

      const firstResponse = await agent.post(`/polls/${pollId}/vote`).send({
        optionIds: [optionId],
      });

      expect(firstResponse.status).toBe(201);

      const secondResponse = await agent.post(`/polls/${pollId}/vote`).send({
        optionIds: [optionId],
      });

      expect(secondResponse.status).toBe(409);

      expect(secondResponse.body).toMatchObject({
        code: "ALREADY_VOTED",
      });

      const votes = await prisma.vote.count({
        where: {
          pollId,
        },
      });

      expect(votes).toBe(1);
    });
  });
});

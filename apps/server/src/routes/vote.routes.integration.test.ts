import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME } from "@/constants/session";

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

    it("should create a multiple-choice vote", async () => {
      await prisma.poll.delete({
        where: {
          id: pollId,
        },
      });

      const poll = await prisma.poll.create({
        data: {
          title: "Multiple choice poll",
          description: "Multiple choice integration test",
          isAnonymous: false,
          isMultipleChoice: true,
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

      const response = await request(app)
        .post(`/polls/${poll.id}/vote`)
        .send({
          optionIds: poll.options.map((option) => option.id),
        });

      expect(response.status).toBe(201);

      expect(response.body.optionIds).toEqual(
        expect.arrayContaining(poll.options.map((option) => option.id))
      );

      const voteOptions = await prisma.voteOption.findMany({
        where: {
          voteId: response.body.id,
        },
      });

      expect(voteOptions).toHaveLength(2);
    });

    it("should reject vote for expired poll", async () => {
      await prisma.poll.delete({
        where: {
          id: pollId,
        },
      });

      const poll = await prisma.poll.create({
        data: {
          title: "Expired poll",
          isAnonymous: false,
          isMultipleChoice: false,
          expiresAt: new Date("2025-01-01T00:00:00.000Z"),
          options: {
            create: {
              text: "Option 1",
              position: 0,
            },
          },
        },
        include: {
          options: true,
        },
      });

      const response = await request(app)
        .post(`/polls/${poll.id}/vote`)
        .send({
          optionIds: [poll.options[0].id],
        });

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        code: "VOTE_NOT_ALLOWED",
      });

      const votes = await prisma.vote.count({
        where: {
          pollId: poll.id,
        },
      });

      expect(votes).toBe(0);
    });

    it("should reject multiple options for single-choice poll", async () => {
      const poll = await prisma.poll.create({
        data: {
          title: "Single choice poll",
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

      const response = await request(app)
        .post(`/polls/${poll.id}/vote`)
        .send({
          optionIds: poll.options.map((option) => option.id),
        });

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        code: "VOTE_NOT_ALLOWED",
      });
    });

    it("should reject option from another poll", async () => {
      const anotherPoll = await prisma.poll.create({
        data: {
          title: "Another poll",
          isAnonymous: false,
          isMultipleChoice: false,
          expiresAt: new Date("2026-12-01T12:00:00.000Z"),
          options: {
            create: {
              text: "Another option",
              position: 0,
            },
          },
        },
        include: {
          options: true,
        },
      });

      const response = await request(app)
        .post(`/polls/${pollId}/vote`)
        .send({
          optionIds: [anotherPoll.options[0].id],
        });

      expect(response.status).toBe(404);

      expect(response.body).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
      });
    });

    it("should set session cookie when voting for the first time", async () => {
      const response = await request(app)
        .post(`/polls/${pollId}/vote`)
        .send({
          optionIds: [optionId],
        });

      expect(response.status).toBe(201);

      const cookies = response.headers["set-cookie"];

      expect(cookies).toBeDefined();
      expect(cookies).toHaveLength(1);
      expect(cookies?.[0]).toContain(`${SESSION_COOKIE_NAME}=`);
    });

    it("should reuse existing session cookie", async () => {
      const agent = request.agent(app);

      const firstResponse = await agent.post(`/polls/${pollId}/vote`).send({
        optionIds: [optionId],
      });

      expect(firstResponse.status).toBe(201);

      const firstSessionId = firstResponse.body.sessionId;

      const secondResponse = await agent.post(`/polls/${pollId}/vote`).send({
        optionIds: [optionId],
      });

      expect(secondResponse.status).toBe(409);

      expect(secondResponse.body).toMatchObject({
        code: "ALREADY_VOTED",
      });

      const votes = await prisma.vote.findMany({
        where: {
          pollId,
        },
      });

      expect(votes).toHaveLength(1);
      expect(votes[0].sessionId).toBe(firstSessionId);
    });

    it("should set a secure session cookie configuration", async () => {
      const response = await request(app)
        .post(`/polls/${pollId}/vote`)
        .send({
          optionIds: [optionId],
        });

      expect(response.status).toBe(201);

      const cookie = response.headers["set-cookie"]?.[0];

      expect(cookie).toBeDefined();
      expect(cookie).toContain(`${SESSION_COOKIE_NAME}=`);
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("SameSite");
    });
  });
});

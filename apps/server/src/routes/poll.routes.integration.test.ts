import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { app } from "@/app";
import { prisma } from "@/lib/prisma";

describe("Poll API integration", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.voteOption.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.session.deleteMany();
    await prisma.option.deleteMany();
    await prisma.poll.deleteMany();
  });

  afterAll(async () => {
    await prisma.voteOption.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.option.deleteMany();
    await prisma.poll.deleteMany();

    await prisma.$disconnect();
  });

  describe("POST /polls", () => {
    it("should create a poll", async () => {
      const response = await request(app)
        .post("/polls")
        .send({
          title: "Integration test poll",
          description: "Created by integration test",
          isAnonymous: false,
          isMultipleChoice: false,
          expiresAt: "2026-12-01T12:00:00.000Z",
          options: [
            {
              text: "Option 1",
            },
            {
              text: "Option 2",
            },
          ],
        });

      expect(response.status).toBe(201);

      expect(response.body).toMatchObject({
        title: "Integration test poll",
        description: "Created by integration test",
        isAnonymous: false,
        isMultipleChoice: false,
        options: expect.arrayContaining([
          {
            id: expect.any(String),
            text: "Option 1",
            votesCount: 0,
          },
          {
            id: expect.any(String),
            text: "Option 2",
            votesCount: 0,
          },
        ]),
      });

      expect(response.body.id).toEqual(expect.any(String));
      expect(response.body.options).toHaveLength(2);
    });
  });

  describe("GET /polls/:id", () => {
    it("should return a poll with results", async () => {
      const session1 = await prisma.session.create({
        data: {
          tokenHash: "test-token-hash-1",
          expiresAt: new Date("2026-12-01T12:00:00.000Z"),
        },
      });

      const session2 = await prisma.session.create({
        data: {
          tokenHash: "test-token-hash-2",
          expiresAt: new Date("2026-12-01T12:00:00.000Z"),
        },
      });

      const session3 = await prisma.session.create({
        data: {
          tokenHash: "test-token-hash-3",
          expiresAt: new Date("2026-12-01T12:00:00.000Z"),
        },
      });

      const poll = await prisma.poll.create({
        data: {
          title: "Results integration test",
          description: "Poll with votes",
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

      const option1 = poll.options.find((option) => option.position === 0);
      const option2 = poll.options.find((option) => option.position === 1);

      expect(option1).toBeDefined();
      expect(option2).toBeDefined();

      if (!option1 || !option2) {
        throw new Error("Test options were not created");
      }

      await prisma.vote.create({
        data: {
          pollId: poll.id,
          sessionId: session1.id,
          ipAddress: "127.0.0.1",
          options: {
            create: {
              optionId: option1.id,
            },
          },
        },
      });

      await prisma.vote.create({
        data: {
          pollId: poll.id,
          sessionId: session2.id,
          ipAddress: "127.0.0.2",
          options: {
            create: {
              optionId: option1.id,
            },
          },
        },
      });

      await prisma.vote.create({
        data: {
          pollId: poll.id,
          sessionId: session3.id,
          ipAddress: "127.0.0.3",
          options: {
            create: {
              optionId: option2.id,
            },
          },
        },
      });

      const response = await request(app).get(`/polls/${poll.id}`);

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        id: poll.id,
        title: "Results integration test",
        description: "Poll with votes",
        isAnonymous: false,
        isMultipleChoice: false,
        options: expect.arrayContaining([
          {
            id: option1.id,
            text: "Option 1",
            votesCount: 2,
          },
          {
            id: option2.id,
            text: "Option 2",
            votesCount: 1,
          },
        ]),
      });

      expect(response.body.options).toHaveLength(2);
    });

    it("should return 404 when poll does not exist", async () => {
      const response = await request(app).get("/polls/550e8400-e29b-41d4-a716-446655440000");

      expect(response.status).toBe(404);

      expect(response.body).toMatchObject({
        code: "POLL_NOT_FOUND",
      });
    });
  });
});

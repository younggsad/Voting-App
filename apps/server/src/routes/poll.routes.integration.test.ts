import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { app } from "@/app";
import { ERROR_CODES } from "@/errors/codes";
import { prisma } from "@/lib/prisma";

describe("Poll API integration", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.voteOption.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.poll.deleteMany();
    await prisma.option.deleteMany();
    await prisma.session.deleteMany();
  });

  afterAll(async () => {
    await prisma.voteOption.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.poll.deleteMany();
    await prisma.option.deleteMany();
    await prisma.session.deleteMany();

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

    it("should reject invalid poll data", async () => {
      const response = await request(app).post("/polls").send({
        title: "",
        options: [],
      });

      expect(response.status).toBe(400);
    });

    it("should reject poll with less than two options", async () => {
      const response = await request(app)
        .post("/polls")
        .send({
          title: "Invalid poll",
          description: "Invalid poll",
          isAnonymous: false,
          isMultipleChoice: false,
          expiresAt: "2026-12-01T12:00:00.000Z",
          options: [
            {
              text: "Only option",
            },
          ],
        });

      expect(response.status).toBe(400);
    });

    it("should reject poll with duplicate options", async () => {
      const response = await request(app)
        .post("/polls")
        .send({
          title: "Duplicate options",
          description: "Invalid poll",
          isAnonymous: false,
          isMultipleChoice: false,
          expiresAt: "2026-12-01T12:00:00.000Z",
          options: [
            {
              text: "Option 1",
            },
            {
              text: "Option 1",
            },
          ],
        });

      expect(response.status).toBe(400);
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

          createdBySession: {
            connect: {
              id: session1.id,
            },
          },

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
        hasVoted: false,
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
        code: ERROR_CODES.POLL_NOT_FOUND,
      });
    });

    it("should return hasVoted true for a session that has voted", async () => {
      const agent = request.agent(app);

      const session = await prisma.session.create({
        data: {
          tokenHash: "test-has-voted-session",
          expiresAt: new Date("2026-12-01T12:00:00.000Z"),
        },
      });

      const poll = await prisma.poll.create({
        data: {
          title: "Has voted test",
          isAnonymous: false,
          isMultipleChoice: false,
          expiresAt: new Date("2026-12-01T12:00:00.000Z"),

          createdBySession: {
            connect: {
              id: session.id,
            },
          },

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

      const voteResponse = await agent.post(`/polls/${poll.id}/vote`).send({
        optionIds: [poll.options[0].id],
      });

      expect(voteResponse.status).toBe(201);

      const response = await agent.get(`/polls/${poll.id}`);

      expect(response.status).toBe(200);
      expect(response.body.hasVoted).toBe(true);
    });

    it("should return hasVoted false for another session", async () => {
      const firstAgent = request.agent(app);
      const secondAgent = request.agent(app);

      const session = await prisma.session.create({
        data: {
          tokenHash: "test-another-session",
          expiresAt: new Date("2026-12-01T12:00:00.000Z"),
        },
      });

      const poll = await prisma.poll.create({
        data: {
          title: "Has voted test",
          isAnonymous: false,
          isMultipleChoice: false,
          expiresAt: new Date("2026-12-01T12:00:00.000Z"),

          createdBySession: {
            connect: {
              id: session.id,
            },
          },

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

      const voteResponse = await firstAgent.post(`/polls/${poll.id}/vote`).send({
        optionIds: [poll.options[0].id],
      });

      expect(voteResponse.status).toBe(201);

      const firstResponse = await firstAgent.get(`/polls/${poll.id}`);
      const secondResponse = await secondAgent.get(`/polls/${poll.id}`);

      expect(firstResponse.status).toBe(200);
      expect(secondResponse.status).toBe(200);

      expect(firstResponse.body.hasVoted).toBe(true);
      expect(secondResponse.body.hasVoted).toBe(false);
    });
  });

  describe("GET /polls/mine", () => {
    it("should return polls created by the current session", async () => {
      const agent = request.agent(app);

      const firstPollResponse = await agent.post("/polls").send({
        title: "My first poll",
        description: "First poll",
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

      expect(firstPollResponse.status).toBe(201);

      const secondPollResponse = await agent.post("/polls").send({
        title: "My second poll",
        description: "Second poll",
        isAnonymous: true,
        isMultipleChoice: true,
        expiresAt: "2026-12-01T12:00:00.000Z",
        options: [
          {
            text: "Option A",
          },
          {
            text: "Option B",
          },
        ],
      });

      expect(secondPollResponse.status).toBe(201);

      const response = await agent.get("/polls/mine");

      expect(response.status).toBe(200);

      expect(response.body.polls).toHaveLength(2);

      expect(response.body.polls).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: firstPollResponse.body.id,
            title: "My first poll",
          }),
          expect.objectContaining({
            id: secondPollResponse.body.id,
            title: "My second poll",
          }),
        ])
      );
    });

    it("should not return polls created by another session", async () => {
      const firstAgent = request.agent(app);
      const secondAgent = request.agent(app);

      const firstPollResponse = await firstAgent.post("/polls").send({
        title: "First session poll",
        description: "Private poll",
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

      expect(firstPollResponse.status).toBe(201);

      const secondPollResponse = await secondAgent.get("/polls/mine");

      expect(secondPollResponse.status).toBe(200);
      expect(secondPollResponse.body.polls).toEqual([]);
    });

    it("should return an empty array when session has no polls", async () => {
      const agent = request.agent(app);

      const response = await agent.get("/polls/mine");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        polls: [],
      });
    });

    it("should return polls ordered by creation date descending", async () => {
      const agent = request.agent(app);

      const firstPollResponse = await agent.post("/polls").send({
        title: "Older poll",
        description: "Older",
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

      expect(firstPollResponse.status).toBe(201);

      const secondPollResponse = await agent.post("/polls").send({
        title: "Newer poll",
        description: "Newer",
        isAnonymous: false,
        isMultipleChoice: false,
        expiresAt: "2026-12-01T12:00:00.000Z",
        options: [
          {
            text: "Option A",
          },
          {
            text: "Option B",
          },
        ],
      });

      expect(secondPollResponse.status).toBe(201);

      const response = await agent.get("/polls/mine");

      expect(response.status).toBe(200);

      expect(response.body.polls).toHaveLength(2);

      expect(response.body.polls[0].id).toBe(secondPollResponse.body.id);
      expect(response.body.polls[1].id).toBe(firstPollResponse.body.id);
    });
  });
});

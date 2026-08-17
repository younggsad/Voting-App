import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";
import { SESSION_TTL_MS } from "@/constants/session";
import { generateSessionToken, hashSessionToken } from "@/utils/session-token";

import { SessionService } from "./session.service";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/utils/session-token", () => ({
  generateSessionToken: vi.fn(),
  hashSessionToken: vi.fn(),
}));

describe("SessionService", () => {
  const service = new SessionService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a session with hashed token", async () => {
      const token = "raw-session-token";
      const tokenHash = "hashed-session-token";
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

      vi.mocked(generateSessionToken).mockReturnValue(token);
      vi.mocked(hashSessionToken).mockReturnValue(tokenHash);

      vi.mocked(prisma.session.create).mockResolvedValue({
        id: "session-1",
        tokenHash,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create();

      expect(generateSessionToken).toHaveBeenCalledOnce();
      expect(hashSessionToken).toHaveBeenCalledWith(token);

      expect(prisma.session.create).toHaveBeenCalledWith({
        data: {
          tokenHash,
          expiresAt: expect.any(Date),
        },
      });

      expect(result).toEqual({
        id: "session-1",
        token,
        expiresAt,
      });
    });

    it("should never store the raw token in database", async () => {
      const token = "super-secret-token";
      const tokenHash = "hashed-token";

      vi.mocked(generateSessionToken).mockReturnValue(token);
      vi.mocked(hashSessionToken).mockReturnValue(tokenHash);

      vi.mocked(prisma.session.create).mockResolvedValue({
        id: "session-1",
        tokenHash,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create();

      const createCall = vi.mocked(prisma.session.create).mock.calls[0][0];

      expect(createCall.data.tokenHash).toBe(tokenHash);
      expect(createCall.data.tokenHash).not.toBe(token);
    });
  });

  describe("findByToken", () => {
    it("should return session for a valid token", async () => {
      const token = "raw-session-token";
      const tokenHash = "hashed-session-token";

      const session = {
        id: "session-1",
        tokenHash,
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(hashSessionToken).mockReturnValue(tokenHash);
      vi.mocked(prisma.session.findUnique).mockResolvedValue(session);

      const result = await service.findByToken(token);

      expect(hashSessionToken).toHaveBeenCalledWith(token);

      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: {
          tokenHash,
        },
      });

      expect(result).toEqual(session);
    });

    it("should return null when session does not exist", async () => {
      vi.mocked(hashSessionToken).mockReturnValue("hashed-token");
      vi.mocked(prisma.session.findUnique).mockResolvedValue(null);

      const result = await service.findByToken("unknown-token");

      expect(result).toBeNull();

      expect(prisma.session.delete).not.toHaveBeenCalled();
    });

    it("should delete expired session and return null", async () => {
      const session = {
        id: "session-1",
        tokenHash: "hashed-token",
        expiresAt: new Date(Date.now() - 1_000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(hashSessionToken).mockReturnValue("hashed-token");
      vi.mocked(prisma.session.findUnique).mockResolvedValue(session);

      const result = await service.findByToken("expired-token");

      expect(result).toBeNull();

      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: {
          id: "session-1",
        },
      });
    });

    it("should not delete valid session", async () => {
      const session = {
        id: "session-1",
        tokenHash: "hashed-token",
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(hashSessionToken).mockReturnValue("hashed-token");
      vi.mocked(prisma.session.findUnique).mockResolvedValue(session);

      const result = await service.findByToken("valid-token");

      expect(result).toEqual(session);
      expect(prisma.session.delete).not.toHaveBeenCalled();
    });
  });
});

import { prisma } from "@/lib/prisma";
import { generateSessionToken, hashSessionToken } from "@/utils/session-token";
import { SESSION_TTL_MS } from "@/constants/session";

export class SessionService {
  async create() {
    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);

    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    const session = await prisma.session.create({
      data: {
        tokenHash,
        expiresAt,
      },
    });

    return {
      id: session.id,
      token,
      expiresAt: session.expiresAt,
    };
  }

  async findByToken(token: string) {
    const tokenHash = hashSessionToken(token);

    const session = await prisma.session.findUnique({
      where: {
        tokenHash,
      },
    });

    if (!session) {
      return null;
    }

    if (session.expiresAt <= new Date()) {
      await prisma.session.delete({
        where: {
          id: session.id,
        },
      });

      return null;
    }

    return session;
  }
}

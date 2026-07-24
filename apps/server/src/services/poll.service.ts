import { NotFoundError } from "@/errors/not-found.error";
import { prisma } from "@/lib/prisma";
import { mapPollToResponse } from "@/mappers/poll.mapper";
import type { CreatePollDto } from "@/validators/poll.validator";

export class PollService {
  async create(data: CreatePollDto) {
    const poll = await prisma.poll.create({
      data: {
        title: data.title,
        description: data.description,
        isAnonymous: data.isAnonymous,
        isMultipleChoice: data.isMultipleChoice,
        expiresAt: new Date(data.expiresAt),

        options: {
          create: data.options.map((option) => ({
            text: option.text,
          })),
        },
      },

      include: {
        options: {
          include: {
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
      },
    });

    return mapPollToResponse(poll);
  }

  async findById(id: string) {
    const poll = await prisma.poll.findUnique({
      where: {
        id,
      },

      include: {
        options: {
          include: {
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
      },
    });

    if (!poll) {
      throw new NotFoundError("Poll not found");
    }

    return mapPollToResponse(poll);
  }
}

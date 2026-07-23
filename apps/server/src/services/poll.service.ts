import { NotFoundError } from "@/errors/not-found.error";
import { prisma } from "@/lib/prisma";
import type { CreatePollDto } from "@/validators/poll.validator";

export class PollService {
  async create(data: CreatePollDto) {
    return prisma.poll.create({
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
        options: true,
      },
    });
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

    return poll;
  }
}

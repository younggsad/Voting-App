import { ERROR_CODES } from "@/errors/codes";
import { NotFoundError } from "@/errors/not-found.error";
import { prisma } from "@/lib/prisma";
import { pollResultsInclude } from "@/lib/prisma/includes";
import { mapPollToResponse, PollDetailsResponse, type PollResponse } from "@/mappers/poll.mapper";
import type { CreatePollDto } from "@/validators/poll.validator";

export class PollService {
  async create(data: CreatePollDto): Promise<PollResponse> {
    const poll = await prisma.poll.create({
      data: {
        title: data.title,
        description: data.description,
        isAnonymous: data.isAnonymous,
        isMultipleChoice: data.isMultipleChoice,
        expiresAt: new Date(data.expiresAt),

        options: {
          create: data.options.map((option, index) => ({
            text: option.text,
            position: index,
          })),
        },
      },

      include: pollResultsInclude,
    });

    return mapPollToResponse(poll);
  }

  async findById(id: string, sessionId: string): Promise<PollDetailsResponse> {
    const poll = await prisma.poll.findUnique({
      where: {
        id,
      },
      include: pollResultsInclude,
    });

    if (!poll) {
      throw new NotFoundError("Poll not found", undefined, ERROR_CODES.POLL_NOT_FOUND);
    }

    const vote = await prisma.vote.findUnique({
      where: {
        pollId_sessionId: {
          pollId: id,
          sessionId,
        },
      },
      select: {
        id: true,
      },
    });

    return {
      ...mapPollToResponse(poll),
      hasVoted: Boolean(vote),
    };
  }
}

import { AppError } from "@/errors/app.error";
import { ERROR_CODES } from "@/errors/codes";
import { ConflictError } from "@/errors/conflict.error";
import { NotFoundError } from "@/errors/not-found.error";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { VoteDto } from "@/validators/vote.validator";

export class VoteService {
  async vote(pollId: string, sessionId: string, ipAddress: string, data: VoteDto) {
    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId,
      },
      include: {
        options: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!poll) {
      throw new NotFoundError("Poll not found", undefined, ERROR_CODES.POLL_NOT_FOUND);
    }

    if (poll.expiresAt <= new Date()) {
      throw new AppError("Poll has expired", 400, ERROR_CODES.VOTE_NOT_ALLOWED);
    }

    const selectedOptions = poll.options.filter((option) => data.optionIds.includes(option.id));

    if (selectedOptions.length !== data.optionIds.length) {
      throw new NotFoundError(
        "One or more options not found",
        undefined,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    if (!poll.isMultipleChoice && data.optionIds.length !== 1) {
      throw new AppError("Only one option can be selected", 400, ERROR_CODES.VOTE_NOT_ALLOWED);
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        pollId_sessionId: {
          pollId,
          sessionId,
        },
      },
    });

    if (existingVote) {
      throw new ConflictError("You have already voted in this poll", ERROR_CODES.ALREADY_VOTED);
    }

    let vote;

    try {
      vote = await prisma.$transaction(async (tx) => {
        const createdVote = await tx.vote.create({
          data: {
            pollId,
            sessionId,
            ipAddress,
          },
        });

        await tx.voteOption.createMany({
          data: data.optionIds.map((optionId) => ({
            voteId: createdVote.id,
            optionId,
          })),
        });

        return createdVote;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("You have already voted in this poll", ERROR_CODES.ALREADY_VOTED);
      }

      throw error;
    }

    return {
      id: vote.id,
      pollId: vote.pollId,
      sessionId: vote.sessionId,
      optionIds: data.optionIds,
      createdAt: vote.createdAt,
    };
  }
}

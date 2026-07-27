import type { Prisma } from "@/generated/prisma/client";

// Общий include для получения опроса с результатами
export const pollResultsInclude = {
  options: {
    include: {
      _count: {
        select: {
          votes: true,
        },
      },
    },
  },
} satisfies Prisma.PollInclude;

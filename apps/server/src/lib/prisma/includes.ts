import type { Prisma } from "@/generated/prisma/client";

// Общий include для получения опроса с результатами
export const pollResultsInclude = {
  options: {
    orderBy: {
      position: "asc",
    },
    include: {
      _count: {
        select: {
          voteOptions: true,
        },
      },
    },
  },
} satisfies Prisma.PollInclude;

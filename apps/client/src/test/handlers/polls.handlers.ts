import { http, HttpResponse } from "msw";

import type { Poll } from "@/features/polls/types";

const API_URL = import.meta.env.VITE_API_URL;

const votedPollIds = new Set<string>();

export const createTestPoll = (hasVoted = false): Poll => ({
  id: "poll-1",
  title: "Test poll",
  description: "Test description",
  isAnonymous: false,
  isMultipleChoice: false,
  expiresAt: "2026-12-01T12:00:00.000Z",
  hasVoted,
  options: [
    {
      id: "option-1",
      text: "Option 1",
      votesCount: 10,
    },
    {
      id: "option-2",
      text: "Option 2",
      votesCount: 5,
    },
  ],
});

export const pollsHandlers = [
  http.get(`${API_URL}/polls/:id`, ({ params }) => {
    const { id } = params;
    const pollId = String(id);

    return HttpResponse.json({
      ...createTestPoll(votedPollIds.has(pollId)),
      id: pollId,
    });
  }),

  http.post(`${API_URL}/polls/:id/vote`, async ({ params, request }) => {
    const { id } = params;
    const pollId = String(id);

    const body = (await request.json()) as {
      optionIds: string[];
    };

    votedPollIds.add(pollId);

    return HttpResponse.json(
      {
        id: "vote-1",
        pollId,
        sessionId: "session-1",
        optionIds: body.optionIds,
        createdAt: "2026-08-20T12:00:00.000Z",
      },
      { status: 201 }
    );
  }),
];

export const resetPollState = () => {
  votedPollIds.clear();
};

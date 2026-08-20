import { http, HttpResponse } from "msw";

import type { Poll } from "@/features/polls/types";

const API_URL = import.meta.env.VITE_API_URL;

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

    return HttpResponse.json({
      ...createTestPoll(),
      id,
    });
  }),
];

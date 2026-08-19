import { api } from "@/shared/api/client";

import type { CreatePollRequest } from "@/features/polls/types/poll.dto";
import type { CreateVoteRequest, CreateVoteResponse, Poll } from "@/features/polls/types";

const POLLS_ENDPOINT = "/polls";

// Создание нового опроса
export const createPoll = async (data: CreatePollRequest): Promise<Poll> => {
  const { data: poll } = await api.post<Poll>(POLLS_ENDPOINT, data);

  return poll;
};

// Получение опроса по id
export const getPollById = async (id: string): Promise<Poll> => {
  const { data: poll } = await api.get<Poll>(`${POLLS_ENDPOINT}/${id}`);

  return poll;
};

// Голосование в опросе
export const createVote = async (
  pollId: string,
  data: CreateVoteRequest
): Promise<CreateVoteResponse> => {
  const { data: vote } = await api.post<CreateVoteResponse>(
    `${POLLS_ENDPOINT}/${pollId}/vote`,
    data
  );

  return vote;
};

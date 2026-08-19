import { api } from "@/shared/api/client";

export interface CreateVoteRequest {
  optionIds: string[];
}

export interface Vote {
  id: string;
  pollId: string;
  sessionId: string;
  optionIds: string[];
  createdAt: string;
}

const POLLS_ENDPOINT = "/polls";

export const createVote = async (pollId: string, data: CreateVoteRequest): Promise<Vote> => {
  const { data: vote } = await api.post<Vote>(`${POLLS_ENDPOINT}/${pollId}/vote`, data);

  return vote;
};

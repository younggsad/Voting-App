import { api } from "@/shared/api/client";

import type { Poll } from "../types";

export interface CreatePollRequest {
  title: string;
  description?: string;

  isAnonymous: boolean;
  isMultipleChoice: boolean;

  expiresAt: string;

  options: {
    text: string;
  }[];
}

export const createPoll = async (data: CreatePollRequest): Promise<Poll> => {
  const response = await api.post<Poll>("/polls", data);

  return response.data;
};

export const getPollById = async (id: string): Promise<Poll> => {
  const response = await api.get<Poll>(`/polls/${id}`);

  return response.data;
};

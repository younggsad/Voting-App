export interface CreateVoteRequest {
  optionIds: string[];
}

export interface CreateVoteResponse {
  id: string;
  pollId: string;
  sessionId: string;
  optionIds: string[];
  createdAt: string;
}

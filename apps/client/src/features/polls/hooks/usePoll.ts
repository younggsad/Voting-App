import { useQuery } from "@tanstack/react-query";
import { getPollById } from "@/features/polls/api/polls.api";
import { pollKeys } from "../types/poll.keys";

export const usePoll = (id: string) => {
  return useQuery({
    queryKey: pollKeys.detail(id),

    queryFn: () => getPollById(id),

    enabled: Boolean(id),
  });
};

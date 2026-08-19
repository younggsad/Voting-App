import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createVote } from "@/features/polls/api/votes.api";
import { pollKeys } from "@/features/polls/query/poll.keys";

export const useVote = (pollId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (optionIds: string[]) =>
      createVote(pollId, {
        optionIds,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pollKeys.detail(pollId),
      });
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPoll } from "@/features/polls/api/polls.api";
import { pollKeys } from "@/features/polls/query/poll.keys";

export const useCreatePoll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPoll,

    onSuccess: (poll) => {
      queryClient.setQueryData(pollKeys.detail(poll.id), poll);
    },
  });
};

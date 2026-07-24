import { useMutation } from "@tanstack/react-query";

import { createPoll } from "../api/polls.api";

export const useCreatePoll = () => {
  return useMutation({
    mutationFn: createPoll,
  });
};

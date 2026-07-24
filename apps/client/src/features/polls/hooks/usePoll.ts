import { useQuery } from "@tanstack/react-query";

import { getPollById } from "../api/polls.api";

export const usePoll = (id: string) => {
  return useQuery({
    queryKey: ["poll", id],
    queryFn: () => getPollById(id),
    enabled: Boolean(id),
  });
};

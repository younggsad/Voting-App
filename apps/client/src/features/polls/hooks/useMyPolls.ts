import { useQuery } from "@tanstack/react-query";

import { getMyPolls } from "@/features/polls/api/polls.api";
import { pollKeys } from "../types/poll.keys";

export const useMyPolls = () => {
  return useQuery({
    queryKey: pollKeys.mine(),
    queryFn: getMyPolls,
  });
};

import { useParams } from "@tanstack/react-router";

import { usePoll } from "@/features/polls/hooks/usePoll";
import { PollResults } from "@/features/polls/components/PollResults";

export function PollPage() {
  const { id } = useParams({
    from: "/poll/$id",
  });

  const { data: poll, isPending, isError } = usePoll(id);

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (isError || !poll) {
    return <p>Poll not found</p>;
  }

  return <PollResults poll={poll} />;
}

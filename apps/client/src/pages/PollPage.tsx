import { useParams } from "@tanstack/react-router";

import { PollVoting } from "@/features/polls/components/PollVoting";
import { PollResults } from "@/features/polls/components/PollResults";
import { usePoll } from "@/features/polls/hooks/usePoll";

import { Loading } from "@/shared/ui/Loading";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";
import { getApiErrorMessage } from "@/shared/api/api-error-message";

export function PollPage() {
  const { id } = useParams({
    from: "/poll/$id",
  });

  const { data: poll, isPending, isError, error } = usePoll(id);

  if (isPending) {
    return <Loading />;
  }

  if (isError || !poll) {
    return <ErrorMessage message={getApiErrorMessage(error, "Failed to load poll.")} />;
  }

  return <div>{poll.hasVoted ? <PollResults poll={poll} /> : <PollVoting poll={poll} />}</div>;
}

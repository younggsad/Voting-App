import { useParams } from "@tanstack/react-router";

import { PollResults } from "@/features/polls/components/PollResults";
import { usePoll } from "@/features/polls/hooks/usePoll";

import { Loading } from "@/shared/ui/Loading";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";

export function PollPage() {
  const { id } = useParams({
    from: "/poll/$id",
  });

  const { data: poll, isPending, isError } = usePoll(id);

  if (isPending) {
    return <Loading />;
  }

  if (isError || !poll) {
    return <ErrorMessage message="Poll not found" />;
  }

  return (
    <main>
      <PollResults poll={poll} />
    </main>
  );
}

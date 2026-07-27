import { PollForm } from "@/features/polls/components/PollForm";

export function CreatePollPage() {
  return (
    <main>
      <section aria-labelledby="create-poll-title">
        <h1 id="create-poll-title">Create poll</h1>

        <PollForm />
      </section>
    </main>
  );
}

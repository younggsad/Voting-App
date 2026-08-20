import type { Poll } from "../types";

import { PollOptionResult } from "./PollOptionResult";

interface PollResultsProps {
  poll: Poll;
}

export function PollResults({ poll }: PollResultsProps) {
  return (
    <section>
      <header>
        <h1>{poll.title}</h1>

        {poll.description && <p>{poll.description}</p>}
      </header>

      <ul>
        {poll.options.map((option) => (
          <PollOptionResult key={option.id} option={option} />
        ))}
      </ul>
    </section>
  );
}

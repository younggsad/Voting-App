import type { Poll } from "../types";

interface Props {
  poll: Poll;
}

export function PollResults({ poll }: Props) {
  return (
    <div>
      <h1>{poll.title}</h1>

      {poll.description && <p>{poll.description}</p>}

      <ul>
        {poll.options.map((option) => (
          <li key={option.id}>
            {option.text}: {option.votesCount}
          </li>
        ))}
      </ul>
    </div>
  );
}

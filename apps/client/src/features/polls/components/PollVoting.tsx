import { useState } from "react";

import type { Poll } from "../types";
import { useVote } from "../hooks/useVote";

interface PollVotingProps {
  poll: Poll;
  onVoted: () => void;
}

export function PollVoting({ poll, onVoted }: PollVotingProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const voteMutation = useVote(poll.id);

  const handleOptionChange = (optionId: string) => {
    if (poll.isMultipleChoice) {
      setSelectedOptions((current) =>
        current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId]
      );

      return;
    }

    setSelectedOptions([optionId]);
  };

  const handleSubmit = () => {
    if (selectedOptions.length === 0) {
      return;
    }

    voteMutation.mutate(selectedOptions, {
      onSuccess: () => {
        onVoted();
      },
    });
  };

  return (
    <section>
      <h2>Vote</h2>

      <fieldset disabled={voteMutation.isPending}>
        <legend>Select your answer</legend>

        {poll.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);

          return (
            <label key={option.id}>
              <input
                type={poll.isMultipleChoice ? "checkbox" : "radio"}
                name="poll-option"
                checked={isSelected}
                onChange={() => handleOptionChange(option.id)}
              />

              {option.text}
            </label>
          );
        })}
      </fieldset>

      {voteMutation.isError && <p role="alert">Failed to submit vote. Please try again.</p>}

      <button
        type="button"
        disabled={selectedOptions.length === 0 || voteMutation.isPending}
        onClick={handleSubmit}
      >
        {voteMutation.isPending ? "Voting..." : "Vote"}
      </button>
    </section>
  );
}

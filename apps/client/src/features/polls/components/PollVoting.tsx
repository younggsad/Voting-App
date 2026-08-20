import { useState } from "react";

import { getApiErrorMessage } from "@/shared/api/api-error-message";

import { useVote } from "../hooks/useVote";
import type { Poll } from "../types";

interface PollVotingProps {
  poll: Poll;
}

export function PollVoting({ poll }: PollVotingProps) {
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
    if (selectedOptions.length === 0 || voteMutation.isPending) {
      return;
    }

    voteMutation.mutate(selectedOptions);
  };

  const errorMessage = voteMutation.isError
    ? getApiErrorMessage(voteMutation.error, "Failed to submit vote. Please try again.")
    : null;

  return (
    <section aria-labelledby="poll-voting-title">
      <header>
        <h1 id="poll-voting-title">{poll.title}</h1>

        {poll.description && <p>{poll.description}</p>}
      </header>

      <fieldset disabled={voteMutation.isPending}>
        <legend>
          {poll.isMultipleChoice ? "Select one or more options" : "Select one option"}
        </legend>

        {poll.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);

          return (
            <label key={option.id}>
              <input
                type={poll.isMultipleChoice ? "checkbox" : "radio"}
                name="poll-option"
                value={option.id}
                checked={isSelected}
                onChange={() => handleOptionChange(option.id)}
              />

              <span>{option.text}</span>
            </label>
          );
        })}
      </fieldset>

      {errorMessage && (
        <p role="alert" aria-live="polite">
          {errorMessage}
        </p>
      )}

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

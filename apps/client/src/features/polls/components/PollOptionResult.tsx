import type { PollOption } from "../types";

interface PollOptionResultProps {
  option: PollOption;
}

// Отображение результата одного варианта ответа
export function PollOptionResult({ option }: PollOptionResultProps) {
  return (
    <li>
      <span>{option.text}</span>

      <span>{option.votesCount} votes</span>
    </li>
  );
}

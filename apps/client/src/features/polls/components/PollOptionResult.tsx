import type { PollOption } from "../types";

import styles from "./PollOptionResult.module.css";

interface PollOptionResultProps {
  option: PollOption;
}

export function PollOptionResult({ option }: PollOptionResultProps) {
  return (
    <li className={styles.option}>
      <span className={styles.text}>{option.text}</span>

      <span className={styles.votes}>
        {option.votesCount} {option.votesCount === 1 ? "vote" : "votes"}
      </span>
    </li>
  );
}

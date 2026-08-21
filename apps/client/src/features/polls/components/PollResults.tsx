import type { Poll } from "../types";

import { PollOptionResult } from "./PollOptionResult";
import styles from "./PollResults.module.css";

interface PollResultsProps {
  poll: Poll;
}

export function PollResults({ poll }: PollResultsProps) {
  return (
    <section className={styles.results}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Poll results</span>

          <h1>{poll.title}</h1>

          {poll.description && <p>{poll.description}</p>}
        </div>
      </header>

      <ul className={styles.list}>
        {poll.options.map((option) => (
          <PollOptionResult key={option.id} option={option} />
        ))}
      </ul>
    </section>
  );
}

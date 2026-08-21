import { PollForm } from "@/features/polls/components/PollForm";

import styles from "./CreatePollPage.module.css";

export function CreatePollPage() {
  return (
    <section className={styles.page} aria-labelledby="create-poll-title">
      <header className={styles.header}>
        <h1 id="create-poll-title">Create a poll</h1>

        <p>Ask a question, add your options, and start collecting votes.</p>
      </header>

      <div className={styles.formCard}>
        <PollForm />
      </div>
    </section>
  );
}

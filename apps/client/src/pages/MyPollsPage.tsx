import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { useMyPolls } from "@/features/polls/hooks/useMyPolls";

import { ErrorMessage } from "@/shared/ui/ErrorMessage";
import { Loading } from "@/shared/ui/Loading";
import { getApiErrorMessage } from "@/shared/api/api-error-message";

import styles from "./MyPollsPage.module.css";

export function MyPollsPage() {
  const { data, isPending, isError, error } = useMyPolls();
  const [now] = useState(() => Date.now());

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return <ErrorMessage message={getApiErrorMessage(error, "Failed to load your polls.")} />;
  }

  const polls = data.polls;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>My polls</h1>
          <p>Polls you created with this session.</p>
        </div>
      </header>

      {polls.length === 0 ? (
        <section className={styles.empty}>
          <h2>No polls yet</h2>
          <p>Create your first poll and start collecting votes.</p>

          <Link to="/create" className={styles.primaryButton}>
            Create a poll
          </Link>
        </section>
      ) : (
        <section className={styles.list} aria-label="Your polls">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce((total, option) => total + option.votesCount, 0);

            const isExpired = new Date(poll.expiresAt).getTime() <= now;

            return (
              <article key={poll.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h2>{poll.title}</h2>

                    {poll.description && <p>{poll.description}</p>}
                  </div>

                  <span className={isExpired ? styles.expired : styles.active}>
                    {isExpired ? "Expired" : "Active"}
                  </span>
                </div>

                <div className={styles.meta}>
                  <span>{poll.options.length} options</span>
                  <span>{totalVotes} votes</span>
                  <span>{poll.isMultipleChoice ? "Multiple choice" : "Single choice"}</span>
                </div>

                <div className={styles.cardFooter}>
                  <span>Ends {new Date(poll.expiresAt).toLocaleDateString()}</span>

                  <Link to="/poll/$id" params={{ id: poll.id }} className={styles.viewButton}>
                    View poll
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

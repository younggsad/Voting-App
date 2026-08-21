import { Link } from "@tanstack/react-router";

import styles from "./HomePage.module.css";

export function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroContent}>
          <h1 id="home-title">Create polls. Share your question. Get answers.</h1>

          <p>
            Create simple polls and collect votes in real time. No account required to get started.
          </p>

          <div className={styles.actions}>
            <Link to="/create" className={styles.primaryButton}>
              Create a poll
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features} aria-labelledby="features-title">
        <h2 id="features-title">Everything you need for quick voting</h2>

        <div className={styles.featureGrid}>
          <article className={styles.feature}>
            <h3>Simple polls</h3>
            <p>Create a poll with a few options and share it with others.</p>
          </article>

          <article className={styles.feature}>
            <h3>Flexible voting</h3>
            <p>Choose between single-choice and multiple-choice voting.</p>
          </article>

          <article className={styles.feature}>
            <h3>Live results</h3>
            <p>See the latest voting results as responses come in.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

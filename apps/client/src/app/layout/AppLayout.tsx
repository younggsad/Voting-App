import { Link, Outlet } from "@tanstack/react-router";

import styles from "./AppLayout.module.css";

export function AppLayout() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            Voting App
          </Link>

          <nav className={styles.navigation} aria-label="Main navigation">
            <Link to="/" className={styles.navigationLink}>
              Home
            </Link>

            <Link to="/create" className={styles.navigationLink}>
              Create poll
            </Link>

            <Link to="/my-polls" className={styles.navigationLink}>
              My polls
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

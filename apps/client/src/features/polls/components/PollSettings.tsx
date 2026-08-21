import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { PollFormValues } from "../schemas/poll.schema";

import styles from "./PollSettings.module.css";

interface PollSettingsProps {
  register: UseFormRegister<PollFormValues>;
  errors: FieldErrors<PollFormValues>;
}

export function PollSettings({ register, errors }: PollSettingsProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>Poll settings</h3>
        <p>Configure how people can participate in your poll.</p>
      </div>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="description">Description</label>

          <textarea
            id="description"
            placeholder="Add some context to your question"
            {...register("description")}
            aria-invalid={Boolean(errors.description)}
          />

          {errors.description && <p className={styles.error}>{errors.description.message}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="expiresAt">Expires at</label>

          <input
            id="expiresAt"
            type="datetime-local"
            {...register("expiresAt")}
            aria-invalid={Boolean(errors.expiresAt)}
          />

          {errors.expiresAt && <p className={styles.error}>{errors.expiresAt.message}</p>}
        </div>
      </div>

      <div className={styles.toggles}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            aria-label="Anonymous voting"
            aria-describedby="anonymous-voting-description"
            {...register("isAnonymous")}
          />

          <span>
            <strong>Anonymous voting</strong>

            <small id="anonymous-voting-description">Hide voter identity from the results.</small>
          </span>
        </label>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            aria-label="Multiple choice"
            aria-describedby="multiple-choice-description"
            {...register("isMultipleChoice")}
          />

          <span>
            <strong>Multiple choice</strong>

            <small id="multiple-choice-description">
              Allow voters to select more than one option.
            </small>
          </span>
        </label>
      </div>
    </section>
  );
}

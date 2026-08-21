import { PollOptions } from "./PollOptions";
import { PollSettings } from "./PollSettings";
import { usePollForm } from "../hooks/usePollForm";

import styles from "./PollForm.module.css";

export function PollForm() {
  const {
    register,
    handleSubmit,
    errors,
    fields,
    append,
    remove,
    onSubmit,
    isPending,
    errorMessage,
  } = usePollForm();

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>Configure your question, options, and voting settings.</h2>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.field}>
          <label htmlFor="title">Title</label>

          <input
            id="title"
            type="text"
            placeholder="Enter poll title"
            {...register("title")}
            aria-invalid={Boolean(errors.title)}
          />

          {errors.title && <p className={styles.fieldError}>{errors.title.message}</p>}
        </div>

        <PollSettings register={register} errors={errors} />

        <PollOptions
          fields={fields}
          register={register}
          append={append}
          remove={remove}
          errors={errors}
        />

        {errorMessage && (
          <p className={styles.formError} role="alert">
            {errorMessage}
          </p>
        )}

        <button className={styles.submitButton} type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create poll"}
        </button>
      </form>
    </section>
  );
}

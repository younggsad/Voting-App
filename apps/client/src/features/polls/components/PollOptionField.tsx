import type { FieldError, UseFormRegister } from "react-hook-form";

import type { PollFormValues } from "../schemas/poll.schema";

import styles from "./PollOptionField.module.css";

interface PollOptionFieldProps {
  index: number;
  register: UseFormRegister<PollFormValues>;
  error?: FieldError;
  onRemove: () => void;
  canRemove: boolean;
}

export function PollOptionField({
  index,
  register,
  error,
  onRemove,
  canRemove,
}: PollOptionFieldProps) {
  const inputId = `option-${index}`;

  return (
    <div className={styles.field}>
      <div className={styles.inputGroup}>
        <label htmlFor={inputId}>Option {index + 1}</label>

        <input
          id={inputId}
          type="text"
          placeholder={`Enter option ${index + 1}`}
          {...register(`options.${index}.text`)}
          aria-invalid={Boolean(error)}
        />

        {error?.message && <p className={styles.error}>{error.message}</p>}
      </div>

      <button
        className={styles.removeButton}
        type="button"
        disabled={!canRemove}
        onClick={onRemove}
      >
        Remove
      </button>
    </div>
  );
}

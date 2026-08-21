import type { FieldArrayWithId, FieldErrors, UseFormRegister } from "react-hook-form";

import type { PollFormValues } from "../schemas/poll.schema";
import { PollOptionField } from "./PollOptionField";

import styles from "./PollOptions.module.css";

interface PollOptionsProps {
  fields: FieldArrayWithId<PollFormValues, "options", "id">[];
  errors: FieldErrors<PollFormValues>;
  register: UseFormRegister<PollFormValues>;
  append: (value: { text: string }) => void;
  remove: (index: number) => void;
}

export function PollOptions({ fields, register, append, remove, errors }: PollOptionsProps) {
  return (
    <fieldset className={styles.fieldset}>
      <div className={styles.header}>
        <legend>Options</legend>
        <span>{fields.length} options</span>
      </div>

      <div className={styles.list}>
        {fields.map((field, index) => (
          <PollOptionField
            key={field.id}
            index={index}
            register={register}
            error={errors.options?.[index]?.text}
            canRemove={fields.length > 2}
            onRemove={() => remove(index)}
          />
        ))}
      </div>

      {errors.options?.message && <p className={styles.error}>{errors.options.message}</p>}

      <button
        type="button"
        aria-label="Add option"
        onClick={() => append({ text: "" })}
        className={styles.addButton}
      >
        + Add option
      </button>
    </fieldset>
  );
}

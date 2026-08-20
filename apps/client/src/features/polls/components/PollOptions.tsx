import type { FieldArrayWithId, FieldErrors, UseFormRegister } from "react-hook-form";

import type { PollFormValues } from "../schemas/poll.schema";
import { PollOptionField } from "./PollOptionField";

interface PollOptionsProps {
  fields: FieldArrayWithId<PollFormValues, "options", "id">[];
  errors: FieldErrors<PollFormValues>;
  register: UseFormRegister<PollFormValues>;
  append: (value: { text: string }) => void;
  remove: (index: number) => void;
}

export function PollOptions({ fields, register, append, remove, errors }: PollOptionsProps) {
  return (
    <fieldset>
      <legend>Options</legend>

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

      {errors.options?.message && <p>{errors.options.message}</p>}

      <button
        type="button"
        onClick={() => {
          append({
            text: "",
          });
        }}
      >
        Add option
      </button>
    </fieldset>
  );
}

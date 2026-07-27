import type { FieldError, UseFormRegister } from "react-hook-form";
import type { PollFormValues } from "../schemas/poll.schema";

interface PollOptionFieldProps {
  index: number;
  register: UseFormRegister<PollFormValues>;
  error?: FieldError;
  onRemove: () => void;
  canRemove: boolean;
}

// Один вариант ответа в форме создания опроса
export function PollOptionField({
  index,
  register,
  error,
  onRemove,
  canRemove,
}: PollOptionFieldProps) {
  return (
    <div>
      <label htmlFor={`option-${index}`}>Option {index + 1}</label>

      <input id={`option-${index}`} {...register(`options.${index}.text`)} />

      {error && <p>{error.message}</p>}

      <button type="button" disabled={!canRemove} onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

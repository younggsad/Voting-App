import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { PollFormValues } from "../schemas/poll.schema";

interface PollSettingsProps {
  register: UseFormRegister<PollFormValues>;

  errors: FieldErrors<PollFormValues>;
}

// Настройки опроса
export function PollSettings({ register, errors }: PollSettingsProps) {
  return (
    <section>
      <h3>Poll settings</h3>

      <div>
        <label htmlFor="description">Description</label>

        <textarea id="description" {...register("description")} />

        {errors.description && <p>{errors.description.message}</p>}
      </div>

      <div>
        <label htmlFor="expiresAt">Expires at</label>

        <input id="expiresAt" type="datetime-local" {...register("expiresAt")} />

        {errors.expiresAt && <p>{errors.expiresAt.message}</p>}
      </div>

      <label>
        <input type="checkbox" {...register("isAnonymous")} />
        Anonymous voting
      </label>

      <label>
        <input type="checkbox" {...register("isMultipleChoice")} />
        Multiple choice
      </label>
    </section>
  );
}

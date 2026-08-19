import { PollOptions } from "./PollOptions";
import { PollSettings } from "./PollSettings";
import { usePollForm } from "../hooks/usePollForm";

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
    <section>
      <h2>Create poll</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="title">Title</label>

          <input id="title" type="text" placeholder="Enter poll title" {...register("title")} />
        </div>

        <PollSettings register={register} errors={errors} />

        <PollOptions
          fields={fields}
          register={register}
          append={append}
          remove={remove}
          errors={errors}
        />

        {errorMessage && <p role="alert">{errorMessage}</p>}

        <button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create poll"}
        </button>
      </form>
    </section>
  );
}

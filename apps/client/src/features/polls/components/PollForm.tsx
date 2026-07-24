import { useForm, useFieldArray } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { pollSchema, type PollFormValues } from "../schemas/poll.schema";

import { useCreatePoll } from "../hooks/useCreatePoll";

import { useNavigate } from "@tanstack/react-router";

export function PollForm() {
  const { register, control, handleSubmit } = useForm<PollFormValues>({
    resolver: zodResolver(pollSchema),

    defaultValues: {
      title: "",
      description: "",
      isAnonymous: false,
      isMultipleChoice: false,
      expiresAt: "",
      options: [
        {
          text: "",
        },
        {
          text: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const navigate = useNavigate();
  const mutation = useCreatePoll();

  const onSubmit = (data: PollFormValues) => {
    mutation.mutate(
      {
        ...data,
        expiresAt: new Date(data.expiresAt).toISOString(),
      },
      {
        onSuccess: (poll) => {
          navigate({
            to: "/poll/$id",
            params: {
              id: poll.id,
            },
          });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} placeholder="Title" />

      <textarea {...register("description")} placeholder="Description" />

      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`options.${index}.text`)} />

          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}

      <input type="datetime-local" {...register("expiresAt")} />
      <button
        type="button"
        onClick={() =>
          append({
            text: "",
          })
        }
      >
        Add option
      </button>

      <button type="submit">Create</button>
    </form>
  );
}

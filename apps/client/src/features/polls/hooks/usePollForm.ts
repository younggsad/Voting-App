import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";

import { useCreatePoll } from "./useCreatePoll";
import { pollSchema, type PollFormValues } from "../schemas/poll.schema";

import { getApiErrorMessage } from "@/shared/api/api-error-message";

const defaultValues: PollFormValues = {
  title: "",
  description: "",
  isAnonymous: false,
  isMultipleChoice: false,
  expiresAt: "",
  options: [{ text: "" }, { text: "" }],
};

export const usePollForm = () => {
  const navigate = useNavigate();
  const createPollMutation = useCreatePoll();

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollSchema),
    defaultValues,
  });

  const {
    control,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const onSubmit = (data: PollFormValues) => {
    createPollMutation.mutate(
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

  return {
    ...form,

    errors,

    fields,
    append,
    remove,

    onSubmit,

    isPending: createPollMutation.isPending,

    isError: createPollMutation.isError,
    error: createPollMutation.error,
    errorMessage: createPollMutation.isError
      ? getApiErrorMessage(createPollMutation.error, "Failed to create poll.")
      : null,
  };
};

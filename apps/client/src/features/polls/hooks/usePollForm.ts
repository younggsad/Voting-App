import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";

import { useCreatePoll } from "./useCreatePoll";
import { pollSchema, type PollFormValues } from "../schemas/poll.schema";

// Значения формы по умолчанию
const defaultValues: PollFormValues = {
  title: "",
  description: "",
  isAnonymous: false,
  isMultipleChoice: false,
  expiresAt: "",
  options: [{ text: "" }, { text: "" }],
};

// Хук, содержащий всю бизнес-логику формы создания опроса
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

  // Управление динамическим списком вариантов ответа
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  // Отправка формы
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
    error: createPollMutation.error,
  };
};

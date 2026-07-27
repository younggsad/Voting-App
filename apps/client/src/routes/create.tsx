import { createFileRoute } from "@tanstack/react-router";

import { CreatePollPage } from "@/pages/CreatePollPage";

export const Route = createFileRoute("/create")({
  component: CreatePollPage,
});

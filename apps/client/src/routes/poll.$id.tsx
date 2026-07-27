import { createFileRoute } from "@tanstack/react-router";

import { PollPage } from "@/pages/PollPage";

export const Route = createFileRoute("/poll/$id")({
  component: PollPage,
});

import { createFileRoute } from "@tanstack/react-router";

import { MyPollsPage } from "@/pages/MyPollsPage";

export const Route = createFileRoute("/my-polls")({
  component: MyPollsPage,
});

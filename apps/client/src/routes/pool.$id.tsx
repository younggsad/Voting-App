import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pool/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/pool/$id"!</div>;
}

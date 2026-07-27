import { RouterProvider as TanStackRouterProvider } from "@tanstack/react-router";

import { router } from "../router";

// Провайдер маршрутизации приложения
export function RouterProvider() {
  return <TanStackRouterProvider router={router} />;
}

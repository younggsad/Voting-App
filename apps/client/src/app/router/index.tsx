import { createRouter } from "@tanstack/react-router";

import { routeTree } from "@/routeTree.gen";

// Глобальный экземпляр роутера приложения
export const router = createRouter({
  routeTree,

  // Предварительно загружать данные при намерении перейти по ссылке
  defaultPreload: "intent",
});

// Регистрация типа роутера для корректной типизации TanStack Router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

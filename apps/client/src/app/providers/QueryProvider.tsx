import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Единый экземпляр QueryClient для всего приложения
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Повторить запрос один раз при ошибке
      retry: 1,

      // Не делать повторный запрос при возврате на вкладку
      refetchOnWindowFocus: false,

      // Считать данные актуальными в течение минуты
      staleTime: 60_000,

      // Хранить неиспользуемые данные в кэше 5 минут
      gcTime: 5 * 60 * 1000,
    },
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

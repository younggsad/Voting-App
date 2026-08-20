import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PollPage } from "./PollPage";

const useParamsMock = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useParams: () => useParamsMock(),
}));

vi.mock("@/features/polls/components/PollVoting", () => ({
  PollVoting: ({ poll }: { poll: { title: string } }) => (
    <div data-testid="poll-voting">{poll.title}</div>
  ),
}));

vi.mock("@/features/polls/components/PollResults", () => ({
  PollResults: ({ poll }: { poll: { title: string } }) => (
    <div data-testid="poll-results">{poll.title}</div>
  ),
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderPollPage = () => {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <PollPage />
    </QueryClientProvider>
  );
};

describe("PollPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useParamsMock.mockReturnValue({
      id: "poll-1",
    });
  });

  it("should load poll from API and render voting UI", async () => {
    renderPollPage();

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("poll-voting")).toHaveTextContent("Test poll");
    });
  });
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/test/handlers/server";

import { PollPage } from "./PollPage";
import { createTestPoll } from "@/test/handlers/polls.handlers";

const API_URL = import.meta.env.VITE_API_URL;

const useParamsMock = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useParams: () => useParamsMock(),
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
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

describe("PollPage voting integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useParamsMock.mockReturnValue({
      id: "poll-1",
    });
  });

  it("should submit vote and show poll results", async () => {
    renderPollPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Test poll" })).toBeInTheDocument();
    });

    const option = screen.getByRole("radio", {
      name: "Option 1",
    });

    fireEvent.click(option);

    expect(screen.getByRole("button", { name: "Vote" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Vote" }));

    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Vote" })).not.toBeInTheDocument();
    });
  });

  it("should show error message when user has already voted", async () => {
    server.use(
      http.post(`${API_URL}/polls/:id/vote`, () => {
        return HttpResponse.json(
          {
            code: "ALREADY_VOTED",
            message: "You have already voted in this poll",
          },
          { status: 409 }
        );
      })
    );

    renderPollPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Test poll" })).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("radio", {
        name: "Option 1",
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Vote" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("You have already voted in this poll.");
    });
  });

  it("should show poll results when user has already voted", async () => {
    server.use(
      http.get(`${API_URL}/polls/:id`, ({ params }) => {
        return HttpResponse.json({
          ...createTestPoll(true),
          id: params.id,
        });
      })
    );

    renderPollPage();

    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    expect(screen.getByText("10 votes")).toBeInTheDocument();
    expect(screen.getByText("5 votes")).toBeInTheDocument();
  });

  it("should show error when poll is not found", async () => {
    server.use(
      http.get(`${API_URL}/polls/:id`, () => {
        return HttpResponse.json(
          {
            code: "POLL_NOT_FOUND",
            message: "Poll not found",
          },
          { status: 404 }
        );
      })
    );

    renderPollPage();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Poll not found.");
    });
  });
});

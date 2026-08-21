import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MyPollsPage } from "./MyPollsPage";

const mockUseMyPolls = vi.hoisted(() => vi.fn());

vi.mock("@/features/polls/hooks/useMyPolls", () => ({
  useMyPolls: mockUseMyPolls,
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    params?: Record<string, string>;
    className?: string;
  }) => {
    const href = props.params?.id ? props.to.replace("$id", props.params.id) : props.to;

    return (
      <a href={href} className={props.className}>
        {children}
      </a>
    );
  },
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MyPollsPage />
    </QueryClientProvider>
  );
}

describe("MyPollsPage", () => {
  it("should render loading state", () => {
    mockUseMyPolls.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    });

    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent("Loading...");
  });

  it("should render error state", () => {
    mockUseMyPolls.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error("Request failed"),
    });

    renderPage();

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("should render empty state when there are no polls", () => {
    mockUseMyPolls.mockReturnValue({
      data: { polls: [] },
      isPending: false,
      isError: false,
      error: null,
    });

    renderPage();

    expect(screen.getByRole("heading", { name: "My polls" })).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "No polls yet" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Create a poll" })).toHaveAttribute("href", "/create");
  });

  it("should render created polls", () => {
    mockUseMyPolls.mockReturnValue({
      data: {
        polls: [
          {
            id: "poll-1",
            title: "Favorite language",
            description: "Choose one",
            isAnonymous: true,
            isMultipleChoice: false,
            expiresAt: "2099-01-01T00:00:00.000Z",
            options: [
              {
                id: "option-1",
                text: "TypeScript",
                votesCount: 3,
              },
              {
                id: "option-2",
                text: "JavaScript",
                votesCount: 2,
              },
            ],
          },
        ],
      },
      isPending: false,
      isError: false,
      error: null,
    });

    renderPage();

    expect(screen.getByRole("heading", { name: "Favorite language" })).toBeInTheDocument();

    expect(screen.getByText("Choose one")).toBeInTheDocument();
    expect(screen.getByText("2 options")).toBeInTheDocument();
    expect(screen.getByText("5 votes")).toBeInTheDocument();
    expect(screen.getByText("Single choice")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "View poll" })).toHaveAttribute("href", "/poll/poll-1");
  });

  it("should render multiple choice poll", () => {
    mockUseMyPolls.mockReturnValue({
      data: {
        polls: [
          {
            id: "poll-2",
            title: "Select technologies",
            description: null,
            isAnonymous: false,
            isMultipleChoice: true,
            expiresAt: "2099-01-01T00:00:00.000Z",
            options: [
              {
                id: "option-1",
                text: "React",
                votesCount: 4,
              },
              {
                id: "option-2",
                text: "Node.js",
                votesCount: 6,
              },
            ],
          },
        ],
      },
      isPending: false,
      isError: false,
      error: null,
    });

    renderPage();

    expect(screen.getByText("Multiple choice")).toBeInTheDocument();
    expect(screen.getByText("10 votes")).toBeInTheDocument();
  });

  it("should render expired poll", () => {
    mockUseMyPolls.mockReturnValue({
      data: {
        polls: [
          {
            id: "poll-3",
            title: "Expired poll",
            description: null,
            isAnonymous: true,
            isMultipleChoice: false,
            expiresAt: "2020-01-01T00:00:00.000Z",
            options: [
              {
                id: "option-1",
                text: "Option 1",
                votesCount: 1,
              },
              {
                id: "option-2",
                text: "Option 2",
                votesCount: 0,
              },
            ],
          },
        ],
      },
      isPending: false,
      isError: false,
      error: null,
    });

    renderPage();

    expect(screen.getByText("Expired")).toBeInTheDocument();
  });
});

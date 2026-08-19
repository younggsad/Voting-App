import { ApiError } from "./api-error";

export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong"): string => {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  switch (error.code) {
    case "ALREADY_VOTED":
      return "You have already voted in this poll.";

    case "VOTE_NOT_ALLOWED":
      return "Voting is no longer available for this poll.";

    case "POLL_NOT_FOUND":
      return "Poll not found.";

    case "RESOURCE_NOT_FOUND":
      return "The selected option was not found.";

    case "SESSION_REQUIRED":
      return "Your session has expired. Please try again.";

    case "BAD_REQUEST":
      return "Invalid request.";

    case "VALIDATION_ERROR":
      return "Please check the entered data.";

    case "NETWORK_ERROR":
      return "Unable to connect to the server. Please check your connection.";

    default:
      return fallback;
  }
};

type PollWithResults = {
  id: string;
  title: string;
  description: string | null;
  isAnonymous: boolean;
  isMultipleChoice: boolean;
  expiresAt: Date;

  options: {
    id: string;
    text: string;
    _count: {
      votes: number;
    };
  }[];
};

export const mapPollToResponse = (poll: PollWithResults) => {
  return {
    id: poll.id,
    title: poll.title,
    description: poll.description,
    isAnonymous: poll.isAnonymous,
    isMultipleChoice: poll.isMultipleChoice,
    expiresAt: poll.expiresAt,

    options: poll.options.map((option) => ({
      id: option.id,
      text: option.text,
      votesCount: option._count.votes,
    })),
  };
};

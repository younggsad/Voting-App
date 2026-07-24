export interface PollOption {
  id: string;
  text: string;
  votesCount: number;
}

export interface Poll {
  id: string;
  title: string;
  description: string | null;

  isAnonymous: boolean;
  isMultipleChoice: boolean;

  expiresAt: string;

  options: PollOption[];
}

// DTO варианта ответа при создании опроса
export interface CreatePollOptionRequest {
  text: string;
}

// DTO создания опроса
export interface CreatePollRequest {
  title: string;
  description?: string;
  isAnonymous: boolean;
  isMultipleChoice: boolean;
  expiresAt: string;
  options: CreatePollOptionRequest[];
}

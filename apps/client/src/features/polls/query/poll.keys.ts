// Единое место для React Query ключей опросов

export const pollKeys = {
  all: ["polls"] as const,

  detail: (id: string) => [...pollKeys.all, id] as const,
};

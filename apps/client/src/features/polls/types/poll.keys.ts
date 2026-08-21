export const pollKeys = {
  all: ["polls"] as const,

  mine: () => [...pollKeys.all, "mine"] as const,

  detail: (id: string) => [...pollKeys.all, "detail", id] as const,
};

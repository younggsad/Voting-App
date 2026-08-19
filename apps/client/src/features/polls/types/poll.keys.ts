export const pollKeys = {
  all: ["polls"] as const,

  detail: (id: string) => ["polls", id] as const,
};

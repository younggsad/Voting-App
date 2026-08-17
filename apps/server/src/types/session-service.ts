export interface SessionServiceContract {
  create(): Promise<{
    id: string;
    token: string;
    expiresAt: Date;
  }>;

  findByToken(token: string): Promise<{
    id: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  } | null>;
}

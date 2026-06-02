export type UserRole = "ADMIN" | "COMMON";

export type User = {
  email: string;
  id: string;
  name: string | null;
  role: UserRole;
};

export type AuthSession = {
  accessToken: string;
  user: User;
};


export type Role = "admin" | "viewer";

export type User = {
  email: string;
  role: Role;
};

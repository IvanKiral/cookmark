type D1PreparedStatement = {
  bind: (...values: ReadonlyArray<unknown>) => D1PreparedStatement;
  run: () => Promise<unknown>;
  first: <T>() => Promise<T | null>;
};

export type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
};

// The users table lives in the recipes database.
type UsersEnv = {
  RECIPES?: D1Database;
};

export type Role = "admin" | "viewer";

export type User = {
  email: string;
  role: Role;
};

export const getUsersDb = (): D1Database | undefined =>
  (globalThis as unknown as { __env__?: UsersEnv }).__env__?.RECIPES;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

// Anything other than an explicit admin is treated as the least-privileged role.
const parseRole = (value: unknown): Role => (value === "admin" ? "admin" : "viewer");

export const readUser = async (db: D1Database, email: string): Promise<User> => {
  const normalizedEmail = normalizeEmail(email);
  const row = await db
    .prepare("SELECT role FROM users WHERE email = ?")
    .bind(normalizedEmail)
    .first<{ role: string }>();
  return { email: normalizedEmail, role: parseRole(row?.role) };
};

// A first-time user is registered as a viewer. An existing row is left
// untouched, so a manually assigned admin role is never overwritten.
export const getOrCreateUser = async (
  db: D1Database,
  email: string,
  now: string,
): Promise<User> => {
  await db
    .prepare("INSERT INTO users (email, created_at) VALUES (?, ?) ON CONFLICT(email) DO NOTHING")
    .bind(normalizeEmail(email), now)
    .run();
  return readUser(db, email);
};

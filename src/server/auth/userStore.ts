import { getEnv } from "~/server/env.ts";
import type { Role, User } from "~/shared/user.ts";

// The users table lives in the recipes database.
export const getUsersDb = (): D1Database | undefined => getEnv().RECIPES;

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

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

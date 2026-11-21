import type { User } from "~/shared/user.ts";

// Also registers a first-time visitor as a viewer. Undefined when signed out
// or when the request fails.
export const fetchCurrentUser = async (): Promise<User | undefined> => {
  try {
    const response = await fetch("/api/me");
    return response.ok ? ((await response.json()) as User) : undefined;
  } catch {
    return undefined;
  }
};

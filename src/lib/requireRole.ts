import { getUserEmail } from "~/lib/access.ts";
import { getUsersDb, type Role, readUser, type User } from "~/lib/userStore.ts";

export type RoleCheck = { isAllowed: true; user: User } | { isAllowed: false; response: Response };

export const hasRole = (role: Role, requiredRole: Role): boolean =>
  requiredRole === "viewer" || role === "admin";

const deny = (message: string, status: number): RoleCheck => ({
  isAllowed: false,
  response: new Response(message, { status }),
});

// Read-only check for protected endpoints. A user without a row yet is a viewer.
export const requireRole = async (request: Request, requiredRole: Role): Promise<RoleCheck> => {
  const email = await getUserEmail(request);
  if (!email) {
    return deny("Unauthorized", 401);
  }
  const db = getUsersDb();
  if (!db) {
    return deny("Users unavailable", 500);
  }
  const user = await readUser(db, email);
  if (!hasRole(user.role, requiredRole)) {
    return deny("Forbidden", 403);
  }
  return { isAllowed: true, user };
};

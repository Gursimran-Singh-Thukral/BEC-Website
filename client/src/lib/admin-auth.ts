import "server-only";
import { adm } from "./api";

export type Me = { id: string; email: string; name: string; role: string };

/**
 * The signed-in admin, confirmed by the API on every call (so removing an admin takes effect immediately).
 * Redirects to the login page when there is no valid admin session.
 */
export async function requireAdmin(): Promise<Me> {
  return adm<Me>("/admin/me");
}

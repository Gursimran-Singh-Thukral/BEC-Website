import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { call } from "@/lib/api-core";
import { ADMIN_EMAIL_DOMAIN } from "@/lib/constants";

const isDev = process.env.NODE_ENV !== "production";

type CheckAdmin = { admin: { email: string; name: string; role: string } | null };

/** Ask the API whether this account is on the admin allow-list (optionally recording the sign-in). */
async function checkAdmin(email: string | null | undefined, name?: string | null, touch = false) {
  if (!email) return null;
  const e = email.trim().toLowerCase();
  if (!e.endsWith(`@${ADMIN_EMAIL_DOMAIN}`)) return null;
  try {
    const r = await call<CheckAdmin>({ role: "public" }, "/internal/check-admin", { method: "POST", json: { email: e, name, touch } });
    return r.admin;
  } catch (err) {
    console.error("[auth] could not reach the API to check the admin list:", err);
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  providers: [
    Google({
      // `hd` only pre-filters the account chooser; the real check is in signIn() below.
      authorization: { params: { hd: ADMIN_EMAIL_DOMAIN, prompt: "select_account" } },
    }),
    // Local development only: sign in as any allow-listed admin without Google.
    ...(isDev
      ? [
          Credentials({
            id: "dev",
            name: "Dev login",
            credentials: { email: {} },
            async authorize(c) {
              const a = await checkAdmin(String(c?.email ?? ""));
              return a ? { id: a.email, email: a.email, name: a.name || a.email } : null;
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google" && profile?.email_verified !== true) return false;
      return !!(await checkAdmin(user.email, user.name, true));
    },
  },
});

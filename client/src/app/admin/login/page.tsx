import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { call } from "@/lib/api-core";
import { ADMIN_EMAIL_DOMAIN } from "@/lib/constants";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };
export const dynamic = "force-dynamic";

const isDev = process.env.NODE_ENV !== "production";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const email = (await auth())?.user?.email?.toLowerCase();
  let isAdmin = false;
  if (email) {
    try {
      await call({ role: "admin", email }, "/admin/me");
      isAdmin = true;
    } catch {}
  }
  if (isAdmin) redirect("/admin");
  const signedIn = !!email;

  async function google() {
    "use server";
    await signIn("google", { redirectTo: "/admin" });
  }
  async function dev(fd: FormData) {
    "use server";
    try {
      await signIn("dev", { email: String(fd.get("email") ?? ""), redirectTo: "/admin" });
    } catch (e) {
      if (e instanceof AuthError) redirect("/admin/login?error=AccessDenied");
      throw e;
    }
  }

  const message = error
    ? error === "AccessDenied" || error === "CredentialsSignin"
      ? `That account isn't on the admin list. Sign in with your @${ADMIN_EMAIL_DOMAIN} account, and ask the BEC president to add you if you need access.`
      : "Sign-in failed. Please try again."
    : signedIn
      ? `You're signed in, but that account isn't an admin. Use an @${ADMIN_EMAIL_DOMAIN} account the BEC president has approved.`
      : null;

  return (
    <div
      className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-12"
      style={{ background: "radial-gradient(circle at 12% 20%, rgba(77,182,255,0.3) 0%, rgba(77,182,255,0) 40%), linear-gradient(170deg, #1E3A8A 0%, #16285F 45%, #111829 100%)" }}
    >
      <div
        aria-hidden="true"
        className="bec-drift pointer-events-none absolute -top-5 -right-5 hidden h-[calc(100%+40px)] w-[38%] bg-linear-to-br from-sky/60 to-ice/10 md:block"
        style={{ clipPath: "polygon(34% 0, 100% 0, 100% 100%, 0 100%)" }}
      />
      <div className="relative w-full max-w-[460px]">
        <div className="clip-corner-lg rounded-[26px] bg-linear-to-b from-white to-ice p-8 shadow-2xl sm:p-10">
          <Image src="/images/bec-logo.png" alt="BEC" width={97} height={40} className="h-10 w-auto" priority />
          <span className="clip-tab mt-7 inline-block bg-navy py-[5px] pr-6 pl-2.5 font-ui text-xs font-semibold text-white">Admin dashboard</span>
          <h1 className="mt-3 font-display text-[40px] leading-[1.02] font-bold tracking-[-0.01em] text-ink">Sign in to BEC.</h1>
          <p className="mt-3 text-[15px] text-body">Manage events, applications, the team and handbooks. Access is limited to approved @{ADMIN_EMAIL_DOMAIN} accounts.</p>

          {message && (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{message}</div>
          )}

          <form action={google} className="mt-7">
            <button className="btn flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 font-ui text-[15px] font-semibold text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#fff" d="M21.35 11.1H12v2.98h5.35c-.23 1.5-1.7 4.4-5.35 4.4a5.9 5.9 0 1 1 0-11.8c1.87 0 3.12.8 3.83 1.48l2.6-2.5A9.3 9.3 0 0 0 12 3.2a9.4 9.4 0 1 0 0 18.8c5.43 0 9.03-3.8 9.03-9.2 0-.62-.07-1.1-.18-1.7z" />
              </svg>
              Continue with Google
            </button>
          </form>

          {isDev && (
            <form action={dev} className="mt-6 rounded-2xl border border-dashed border-sky bg-white/70 p-4">
              <div className="font-ui text-xs font-semibold text-navy">Development only: no Google needed</div>
              <div className="mt-2 flex gap-2">
                <input name="email" type="email" required placeholder={`you@${ADMIN_EMAIL_DOMAIN}`} className="min-h-11 w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 text-[15px] outline-none focus:border-sky" />
                <button className="btn cursor-pointer rounded-full bg-navy px-4 font-ui text-sm font-semibold text-white">Go</button>
              </div>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-ice">
          <Link href="/" className="text-ice underline">← Back to the website</Link>
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ButtonLink } from "@/components/site/ui";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-5 text-center text-white" style={{ background: "linear-gradient(170deg, #1E3A8A 0%, #16285F 45%, #111829 100%)" }}>
      <div>
        <div className="text-grad font-display text-[clamp(96px,18vw,200px)] leading-none font-bold">404</div>
        <h1 className="mt-2 font-display text-4xl font-bold">This idea hasn&apos;t launched yet.</h1>
        <p className="mx-auto mt-3 max-w-md text-ice">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/" arrow="→">Back home</ButtonLink>
          <Link href="/initiatives" className="btn rounded-full border-[1.5px] border-white/70 px-[21px] py-[13px] font-ui text-sm font-semibold text-white no-underline">See what&apos;s on</Link>
        </div>
      </div>
    </div>
  );
}

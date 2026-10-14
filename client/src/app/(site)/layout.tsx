import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { getSite } from "@/lib/data";

// Pages read live data from SQLite, so they must never be prerendered at build time.
export const dynamic = "force-dynamic";
// Allow time for the API server to wake up on free hosting.
export const maxDuration = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getSite();
  return (
    <div className="bg-white font-sans text-[17px] leading-[1.55] text-ink">
      <div className="scroll-bar" aria-hidden="true" />
      <Nav />
      <main>{children}</main>
      <Footer settings={settings} />
    </div>
  );
}

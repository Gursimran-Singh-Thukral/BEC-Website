import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  return ["", "/initiatives", "/team", "/handbooks", "/join"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));
}

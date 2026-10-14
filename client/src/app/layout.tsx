import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Fonts are bundled locally so the site builds and runs without reaching Google.
const inter = localFont({
  src: "./fonts/Inter-latin.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});
const montserrat = localFont({
  src: "./fonts/Montserrat-latin.woff2",
  variable: "--font-montserrat",
  weight: "100 900",
  display: "swap",
});
const spartan = localFont({
  src: "./fonts/LeagueSpartan-latin.woff2",
  variable: "--font-spartan",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "BEC IIT Jammu | Budding Entrepreneurs' Club",
    template: "%s | BEC IIT Jammu",
  },
  description:
    "The student-run E-Cell of IIT Jammu. Workshops, speaker sessions, bootcamps and case challenges, plus a direct line into the institute's incubation ecosystem.",
  openGraph: {
    title: "BEC IIT Jammu",
    description: "Ideas in. Ventures out. The Budding Entrepreneurs' Club of IIT Jammu.",
    images: ["/images/hero-poster.jpg"],
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#1E3A8A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${montserrat.variable} ${spartan.variable}`}>
      <body>{children}</body>
    </html>
  );
}

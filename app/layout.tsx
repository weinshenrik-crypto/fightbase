import type { Metadata, Viewport } from "next";
import { Oswald, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const title = "Fightbase — Combat sports events calendar";
const description =
  "Track every boxing, MMA, Muay Thai, kickboxing, jiu-jitsu, judo, wrestling, karate and taekwondo event that matters to you, all in one place.";

export const metadata: Metadata = {
  metadataBase: new URL("https://fightbase.io"),
  title,
  description,
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fightbase",
  },
  openGraph: {
    title,
    description,
    url: "https://fightbase.io",
    siteName: "Fightbase",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
  verification: {
    google: "TwhOwpttMqJxwt2xy7Z9MGB8T6VfTvTH6GR1zMT4cXs",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Fightbase",
    url: "https://fightbase.io",
    description,
  };

  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable}`}>
      <body className="font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}

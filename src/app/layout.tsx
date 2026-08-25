import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://playbeat.digital"),
  title: {
    default: "PlayBeat Digital — Premium Digital Marketplace & Smart Projectors",
    template: "%s — PlayBeat Digital",
  },
  description:
    "Instant digital keys, gaming accounts, subscriptions, SaaS licenses, and high-performance 4K Smart Projectors with 24/7 automated delivery.",
  keywords: [
    "gaming keys",
    "game accounts",
    "streaming subscriptions",
    "smart projectors",
    "IPTV",
    "SaaS tools",
    "gift cards",
    "instant delivery",
    "PlayBeat Digital",
  ],
  authors: [{ name: "PlayBeat Digital" }],
  creator: "PlayBeat Digital",
  publisher: "PlayBeat Digital",
  applicationName: "PlayBeat Digital",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PlayBeat Digital — Luxury Digital Commerce & Smart Projectors",
    description:
      "Instant digital keys, game accounts, streaming subscriptions & 4K Smart Projectors with 24/7 automated delivery.",
    url: "https://playbeat.digital",
    siteName: "PlayBeat Digital",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlayBeat Digital — Premium Digital Marketplace & Smart Projectors",
    description:
      "Instant digital keys, gaming accounts, subscriptions & 4K Smart Projectors with 24/7 automated delivery.",
  },
  icons: {
    icon: "/playbeat-logo.png",
    apple: "/playbeat-logo.png",
  },
  category: "shopping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${jakarta.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

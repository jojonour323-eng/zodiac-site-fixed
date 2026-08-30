import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Celestial — Your Birth Chart in Plain English",
  description: "Discover your Sun, Moon, and Rising signs, get a full birth chart breakdown with houses, and check real compatibility — powered by local Swiss Ephemeris calculations.",
  keywords: ["astrology", "zodiac", "birth chart", "natal chart", "synastry", "compatibility", "horoscope"],
  authors: [{ name: "Celestial" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Celestial — Your Birth Chart in Plain English",
    description: "Sun, Moon, Rising signs, full chart with houses, and real compatibility scoring.",
    siteName: "Celestial",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Celestial — Your Birth Chart in Plain English",
    description: "Sun, Moon, Rising signs, full chart with houses, and real compatibility scoring.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

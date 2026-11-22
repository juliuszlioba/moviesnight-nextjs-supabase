import './globals.css';

import { Analytics } from '@vercel/analytics/next';
import Footer from "./footer";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/components/ui/sonner";
import { preconnect } from "react-dom";

export const metadata: Metadata = {
  title: "MoviesNight",
  description: "Movies, series and anime I have watched, with ratings and reviews.",
};

export const viewport: Viewport = {
  // Matches the dark --background (oklch(0.145 0 0))
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  // Lets the safe-area insets below take effect on notched phones
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Posters on nearly every page come from the TMDB image CDN
  preconnect("https://image.tmdb.org");

  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.className} antialiased bg-background text-foreground`}
      >
        <a
          href="#main-content"
          className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
        >
          Skip to content
        </a>
        <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col pt-[max(0.5rem,env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] pl-[max(1.25rem,env(safe-area-inset-left))] md:pt-8 md:pr-[max(1rem,env(safe-area-inset-right))] md:pl-[max(1rem,env(safe-area-inset-left))] 2xl:pt-24">
          {children}
          <Footer />
        </div>
        <Toaster theme="dark" />
        <Analytics />
        <SpeedInsights/>
      </body>
    </html>
  );
}

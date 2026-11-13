import './globals.css';

import { Analytics } from '@vercel/analytics/next';
import Footer from "./footer";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "MoviesNight",
  description: "Movies, series and anime I have watched, with ratings and reviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} antialiased dark bg-background text-foreground`}
      >
        <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-5 pt-2 md:px-4 md:pt-8 2xl:pt-24">
          {children}
          <Footer />
        </div>
        <Toaster />
        <Analytics />
        <SpeedInsights/>
      </body>
    </html>
  );
}

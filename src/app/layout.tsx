import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GitHub Roast Card",
  description: "Generate a funny roast card for your GitHub profile",
  keywords: [
    "GitHub",
    "Roast Card",
    "Parody Trading Card",
    "Funny GitHub Profile",
    "Developer Humor",
    "AI Generated Roast",
  ],
  openGraph: {
    title: "GitHub Roast Card",
    description: "Generate a funny roast card for your GitHub profile",
    url: "https://github-roast-card.vercel.app",
    type: "website",
    images: [
      {
        url: "https://github-roast-card.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "GitHub Roast Card OG Image",
      },
    ],
  },
  metadataBase: new URL("https://github-roast-card.vercel.app"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <Header />
      {children}
      <Footer />
      <Analytics />
      </body>
      </html>
  );
}
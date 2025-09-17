import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Analytics } from "@vercel/analytics/next"


export const metadata = {
  title: "GitHub/X Roast Card",
    icons: {
        icon: "/flammingoctopus.ico",
    },
  description: "Generate a funny roast card for your GitHub or X profile completely free.",
  keywords: [
    "GitHub",
    "Roast Card", "Twitter", "X",
    "Parody Trading Card",
    "Funny GitHub Profile",
    "Developer Humor",
    "AI Generated Roast",
  ],
  openGraph: {
    title: "GitHub Roast Card",
    description: "Generate a funny roast card for your GitHub or X profile completely free.",
    url: "https://profile-roasting.vercel.app",
    type: "website",
    images: [
      {
        url: "https://profile-roasting.vercel.app/public/example-roast-card.png",
        width: 1200,
        height: 630,
        alt: "GitHub Roast Card OG Image",
      },
    ],
  },
  metadataBase: new URL("https://profile-roasting.vercel.app"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
        <head>
            <link rel="icon" href="/flammingoctopus.ico" sizes="any" />
        </head>
        <body className="antialiased">
        <Header />
        {children}
        <Footer />
        <Analytics />
        </body>
        </html>
    );
}
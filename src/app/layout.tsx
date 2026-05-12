import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Spend Audit — are you overpaying for AI tools?",
  description:
    "Free 2-minute audit for startups. See exactly where your team is overspending on AI tools and what to switch — no account needed.",
  openGraph: {
    title: "AI Spend Audit — are you overpaying for AI tools?",
    description:
      "Free 2-minute audit for startups. See exactly where your team is overspending on AI tools and what to switch — no account needed.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "AI Spend Audit",
    type: "website",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "AI Spend Audit — free tool for startups",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Spend Audit — are you overpaying for AI tools?",
    description:
      "Free 2-minute audit for startups. See exactly where your team is overspending on AI tools and what to switch — no account needed.",
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/opengraph-image`],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

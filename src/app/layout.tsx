import type { Metadata } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "DevLaunch",
    template: "%s | DevLaunch"
  },
  description:
    "Build a public developer portfolio, manage projects, track internship applications, and launch your developer career.",
  applicationName: "DevLaunch",
  keywords: [
    "developer portfolio",
    "student developer",
    "internship tracker",
    "career dashboard",
    "Next.js",
    "Firebase"
  ],
  openGraph: {
    title: "DevLaunch",
    description:
      "A student developer career dashboard for portfolios, projects, and internship tracking.",
    siteName: "DevLaunch",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "DevLaunch",
    description:
      "A student developer career dashboard for portfolios, projects, and internship tracking."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body className={`${ebGaramond.variable} ${manrope.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

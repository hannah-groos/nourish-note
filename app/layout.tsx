import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global Home button (routes to /) */}
          <div className="fixed top-4 left-4 z-50">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 text-sm sm:text-base bg-transparent border border-[var(--teal-200)] dark:border-[var(--teal-800)] text-[var(--teal-900)] dark:text-[var(--teal-100)] font-medium rounded-lg shadow-sm hover:bg-[var(--teal-100)] dark:hover:bg-[var(--teal-900)] transition-colors"
            >
              Home
            </Link>
          </div>
          {/* Global theme toggle */}
          <div className="fixed top-4 right-4 z-50">
            <ThemeSwitcher />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

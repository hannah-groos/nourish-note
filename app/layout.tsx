import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import TimezoneSelector from "@/components/ui/timezone-selector";
import { LogoutButton } from "@/components/logout-button";
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
          {/* Header: Brand + Timezone (left), Theme + Logout (right) */}
          <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-base sm:text-lg font-semibold text-[var(--teal-900)] dark:text-[var(--teal-100)] hover:text-[var(--teal-700)] dark:hover:text-[var(--teal-300)] transition-colors"
                aria-label="NourishNote Home"
              >
                NourishNote
              </Link>
              <TimezoneSelector />
            </div>
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <LogoutButton />
            </div>
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

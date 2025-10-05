"use client";

import Link from "next/link";
import { useState } from "react";
import TimezoneSelector from "./ui/timezone-selector";
import { ThemeSwitcher } from "./theme-switcher";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed inset-x-0 top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side: Logo + Timezone */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xl font-bold text-[var(--teal-900)] dark:text-[var(--teal-100)] hover:text-[var(--teal-700)] dark:hover:text-[var(--teal-300)] transition-colors"
            >
              NourishNote
            </Link>
            <TimezoneSelector />
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/chat"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Chat
            </Link>
            <Link
              href="/entries"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Entries
            </Link>
            <ThemeSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
            >
              {isOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-md px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/chat"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Chat
          </Link>
          <Link
            href="/entries"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Entries
          </Link>
          <Link
            href="/login"
            className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-500 hover:bg-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}

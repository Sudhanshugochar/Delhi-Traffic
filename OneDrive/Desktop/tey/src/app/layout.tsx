'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar, TopBar } from "@/components/layout/Navigation";
import { NotificationContainer } from "@/components/common/Notifications";
import { useThemeStore } from "@/context/store";
import { useEffect, useState } from "react";

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
  const { isDarkMode } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <html lang="en" className={isDarkMode ? "dark" : ""}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors`}
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
            <TopBar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        <NotificationContainer />
      </body>
    </html>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Key,
  Signature,
  FileText,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { useUIStore, useThemeStore } from '@/context/store';
import clsx from 'clsx';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const navItems = [
    { href: '/certificates', label: 'Certificates', icon: Shield },
    { href: '/ssh-keys', label: 'SSH Keys', icon: Key },
    { href: '/code-signing', label: 'Code Signing', icon: Signature },
    { href: '/audit-logs', label: 'Audit Logs', icon: FileText },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => useUIStore.setState({ sidebarOpen: false })}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col transition-transform lg:static lg:translate-x-0 z-30',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="border-b border-gray-800 px-6 py-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield size={28} className="text-blue-400" />
            <span>Identity</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => useUIStore.setState({ sidebarOpen: false })}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive(href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium text-sm">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export const TopBar: React.FC = () => {
  const { isDarkMode } = useThemeStore();

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Identity Asset Dashboard
      </h1>

      {/* User Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
          JD
        </div>
      </div>
    </header>
  );
};

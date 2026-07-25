'use client';

import React, { useState } from 'react';
import { Bell, Sun, Moon, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useScans } from '@/context/ScanContext';

import SearchBarPill from './SearchBarPill';

export default function DashboardTopbar() {
  const { user } = useAuth();
  const { scans } = useScans();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement?.classList?.toggle('dark');
  };

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'G';
  const displayName = user?.fullName || 'Farmer (Guest)';
  const displayLocation = user ? `${user.district}, ${user.state}` : 'India';

  return (
    <header className="sticky top-0 z-20 h-16 bg-card/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6 lg:px-8">
      {/* Left — Search Bar Pill */}
      <div className="flex items-center gap-3">
        <SearchBarPill className="w-64 sm:w-72 md:w-80" />
      </div>

      {/* Right — Theme, Alerts, User Profile */}
      <div className="flex items-center gap-2">

        <button
          onClick={toggleDark}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? (
            <Sun size={18} className="text-secondary" />
          ) : (
            <Moon size={18} className="text-muted-foreground" />
          )}
        </button>

        <Link
          href="/scan-history"
          className="relative p-2 rounded-xl hover:bg-muted transition-colors"
          title="Scan History Alerts"
        >
          <Bell size={18} className="text-muted-foreground" />
          {scans.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
              {scans.length}
            </span>
          )}
        </Link>

        {user ? (
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-xl hover:bg-muted px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full gradient-green flex items-center justify-center">
              <span className="text-white font-bold text-sm">{initial}</span>
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{displayLocation}</p>
            </div>
          </Link>
        ) : (
          <Link
            href="/sign-up-login-screen"
            className="flex items-center gap-1.5 btn-primary text-xs px-3 py-1.5 h-9"
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}

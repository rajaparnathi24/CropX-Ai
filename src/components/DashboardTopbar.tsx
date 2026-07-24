'use client';

import React, { useState } from 'react';
import { Bell, Search, Sun, Moon, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useScans } from '@/context/ScanContext';

export default function DashboardTopbar() {
  const { user } = useAuth();
  const { scans } = useScans();
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement?.classList?.toggle('dark');
  };

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'G';
  const displayName = user?.fullName || 'Farmer (Guest)';
  const displayLocation = user ? `${user.district}, ${user.state}` : 'India';

  return (
    <header className="sticky top-0 z-20 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 lg:px-8">
      {/* Left — Search */}
      <div className="flex items-center gap-3">
        {searchOpen ? (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2 w-48 md:w-64">
            <Search size={14} className="text-muted-foreground flex-shrink-0" />
            <input
              autoFocus
              onBlur={() => setSearchOpen(false)}
              type="text"
              placeholder="Search diseases, crops..."
              className="text-sm bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full"
            />
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors w-56"
          >
            <Search size={14} />
            <span>Search crops, diseases...</span>
            <span className="ml-auto text-xs bg-muted rounded-md px-1.5 py-0.5 font-mono">⌘K</span>
          </button>
        )}
      </div>

      {/* Right — Theme, Alerts, User Profile */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSearchOpen(true)}
          className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <Search size={18} className="text-muted-foreground" />
        </button>

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

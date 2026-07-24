'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, ScanLine, History, Users, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentPath: string;
}

const TABS = [
  { icon: LayoutDashboard, label: 'Home', href: '/home-dashboard' },
  { icon: ScanLine, label: 'Scan', href: '/ai-scan' },
  { icon: History, label: 'History', href: '/scan-history' },
  { icon: Users, label: 'Community', href: '/community' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export default function MobileBottomNav({ currentPath }: MobileBottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = currentPath === tab.href;
          return (
            <Link
              key={`mobile-nav-${tab.label}`}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-accent' : ''}`}>
                <TabIcon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

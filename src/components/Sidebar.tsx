'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from './ui/AppLogo';
import {
  LayoutDashboard,
  ScanLine,
  History,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Sprout,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useScans } from '@/context/ScanContext';

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const { user, logout } = useAuth();
  const { scans } = useScans();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.push('/sign-up-login-screen');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Home', href: '/home-dashboard', badge: null },
    { icon: ScanLine, label: 'AI Scan', href: '/ai-scan', badge: 'AI' },
    {
      icon: History,
      label: 'Scan History',
      href: '/scan-history',
      badge: scans.length > 0 ? String(scans.length) : null,
    },
    { icon: TrendingUp, label: 'Disease Reports', href: '/disease-reports', badge: null },
    { icon: Users, label: 'Community', href: '/community', badge: null },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings', href: '/settings', badge: null },
    { icon: User, label: 'Profile', href: '/profile', badge: null },
  ];

  const displayName = user?.fullName || 'Farmer (Guest)';
  const displayLocation = user ? `${user.district}, ${user.state}` : 'India';

  return (
    <aside
      className={`hidden lg:flex fixed left-0 top-0 h-full flex-col bg-card border-r border-border z-30 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-border h-16 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}
      >
        {!collapsed && (
          <Link href="/home-dashboard" className="flex items-center gap-2 min-w-0">
            <AppLogo size={32} />
            <span className="font-bold text-lg text-primary truncate">CropX</span>
          </Link>
        )}
        {collapsed && <AppLogo size={32} />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex-shrink-0 w-7 h-7 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* User Info Strip */}
      {!collapsed && (
        <div className="mx-3 mt-3 rounded-xl bg-accent border border-primary/20 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center flex-shrink-0">
              <Sprout size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{displayLocation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
            Main Menu
          </p>
        )}
        {navItems.map((item) => {
          const ItemIcon = item.icon;
          const isActive = currentPath === item.href;
          return (
            <Link
              key={`nav-${item.label}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`nav-item ${isActive ? 'nav-item-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <ItemIcon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-xs font-bold rounded-full px-2 py-0.5 flex-shrink-0 ${
                        item.badge === 'AI'
                          ? 'bg-secondary/20 text-secondary'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pb-4 border-t border-border pt-3 space-y-1">
        {bottomItems.map((item) => {
          const ItemIcon = item.icon;
          const isActive = currentPath === item.href;
          return (
            <Link
              key={`nav-bottom-${item.label}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`nav-item ${isActive ? 'nav-item-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <ItemIcon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className={`w-full text-left nav-item text-severity-high hover:bg-severity-high/10 hover:text-severity-high ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

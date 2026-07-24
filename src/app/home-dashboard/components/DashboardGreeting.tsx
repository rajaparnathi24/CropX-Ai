'use client';

import React from 'react';
import { Sprout, CalendarDays, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getIndianSeason, SEASONS_INFO } from '@/constants/seasons';

export default function DashboardGreeting() {
  const { user } = useAuth();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const season = getIndianSeason(now);
  const seasonMeta = SEASONS_INFO[season];

  const dateFormatted = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const displayName = user?.fullName ? user.fullName.split(' ')[0] : 'Farmer';
  const displayLocation = user ? `${user.district}, ${user.state}` : 'India';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg gradient-green flex items-center justify-center">
            <Sprout size={14} className="text-white" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {greeting}, {displayName} 👋
          </p>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Farm Health Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
          <MapPin size={14} className="text-primary" /> {displayLocation}
        </p>
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 self-start sm:self-auto">
        <CalendarDays size={16} className="text-primary" />
        <div>
          <p className="text-xs font-semibold text-foreground">{dateFormatted}</p>
          <p className="text-xs text-muted-foreground">
            {seasonMeta.name} Season ({seasonMeta.localName})
          </p>
        </div>
      </div>
    </div>
  );
}

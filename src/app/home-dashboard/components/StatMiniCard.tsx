import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatMiniCardProps {
  id: string;
  label: string;
  value: string;
  unit: string;
  trend: string;
  trendUp: boolean;
  icon: string;
}

export default function StatMiniCard({
  label,
  value,
  unit,
  trend,
  trendUp,
  icon,
}: StatMiniCardProps) {
  return (
    <div className="card-base flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-lg flex-shrink-0">
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
            trendUp
              ? 'bg-severity-low-bg text-severity-low'
              : 'bg-severity-high-bg text-severity-high'
          }`}
        >
          {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          <span>{trend}</span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
    </div>
  );
}

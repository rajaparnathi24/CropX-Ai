'use client';

import React from 'react';
import { AlertTriangle, AlertOctagon, Info, ChevronRight, ShieldCheck } from 'lucide-react';
import { useScans } from '@/context/ScanContext';
import Link from 'next/link';

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertOctagon,
    bgClass: 'bg-severity-critical-bg border-severity-critical/30',
    textClass: 'text-severity-critical',
    badgeClass: 'severity-critical',
    label: 'CRITICAL',
  },
  high: {
    icon: AlertTriangle,
    bgClass: 'bg-severity-high-bg border-severity-high/30',
    textClass: 'text-severity-high',
    badgeClass: 'severity-high',
    label: 'HIGH',
  },
  medium: {
    icon: AlertTriangle,
    bgClass: 'bg-severity-medium-bg border-severity-medium/30',
    textClass: 'text-severity-medium',
    badgeClass: 'severity-medium',
    label: 'MEDIUM',
  },
  low: {
    icon: Info,
    bgClass: 'bg-accent border-primary/20',
    textClass: 'text-primary',
    badgeClass: 'severity-low',
    label: 'LOW',
  },
};

export default function DiseaseAlertsSection() {
  const { scans } = useScans();

  if (scans.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Disease Alerts</h2>
            <p className="text-xs text-muted-foreground mt-0.5">0 active alerts</p>
          </div>
        </div>

        <div className="card-base p-6 flex items-center justify-between gap-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">No Disease Outbreaks Logged</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Scan crop leaves regularly to detect early fungal/bacterial leaf symptoms.
              </p>
            </div>
          </div>
          <Link href="/ai-scan" className="btn-primary text-xs px-3.5 py-2 flex-shrink-0">
            Scan Crop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Disease Alerts</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {scans.length} active alert{scans.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/disease-reports"
          className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
        >
          View Reports <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-3">
        {scans.slice(0, 4).map((scan, idx) => {
          const config =
            SEVERITY_CONFIG[scan.severity as keyof typeof SEVERITY_CONFIG] ||
            SEVERITY_CONFIG.medium;
          const SevIcon = config.icon;
          const dateStr = new Date(scan.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          });

          return (
            <div
              key={scan.id}
              className={`rounded-2xl border p-4 flex flex-col gap-3 card-shadow fade-in-up stagger-${idx + 1} ${config.bgClass}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SevIcon size={16} className={config.textClass} />
                  <span className={`severity-badge ${config.badgeClass}`}>{config.label}</span>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{dateStr}</span>
              </div>

              <div>
                <p className={`text-sm font-bold ${config.textClass}`}>{scan.disease}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {scan.crop} · {scan.season} Season
                </p>
                <p className="text-xs text-foreground/80 mt-2 leading-relaxed line-clamp-2">
                  {scan.symptoms[0] || 'Symptoms logged by AI scanner.'}
                </p>
              </div>

              <Link
                href="/disease-reports"
                className={`mt-auto text-xs font-semibold flex items-center gap-1 ${config.textClass} hover:underline`}
              >
                View Recommendation <ChevronRight size={12} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

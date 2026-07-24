'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, ScanLine, Sprout } from 'lucide-react';
import { useScans } from '@/context/ScanContext';
import Link from 'next/link';

const CIRCUMFERENCE = 251.2;

function getScoreColor(score: number): string {
  if (score >= 80) return '#388E3C';
  if (score >= 60) return '#F9A825';
  if (score >= 40) return '#E65100';
  return '#C62828';
}

export default function CropHealthScoreCard() {
  const { scans } = useScans();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Compute dynamic health score from actual scans
  const criticalCount = scans.filter((s) => s.severity === 'critical').length;
  const highCount = scans.filter((s) => s.severity === 'high').length;
  const mediumCount = scans.filter((s) => s.severity === 'medium').length;

  let healthScore = 100;
  if (scans.length > 0) {
    const penalty = criticalCount * 25 + highCount * 15 + mediumCount * 5;
    healthScore = Math.max(20, Math.min(100, 100 - penalty));
  }

  const scoreColor = getScoreColor(healthScore);
  const dashOffset = animated ? CIRCUMFERENCE - (healthScore / 100) * CIRCUMFERENCE : CIRCUMFERENCE;

  return (
    <div className="card-base h-full flex flex-col justify-between" style={{ minHeight: '220px' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Overall Crop Health
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {scans.length > 0 ? `${scans.length} total crop scans` : 'Clean Farm Record'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-accent border border-primary/20 px-2.5 py-1">
          <ShieldCheck size={14} className="text-primary" />
          <span className="text-xs font-semibold text-primary">
            {scans.length === 0 ? 'No Active Outbreaks' : `${scans.length} Scans Logged`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-4">
        {/* Radial score */}
        <div className="relative flex-shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
                transition: 'stroke-dashoffset 1.2s ease-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums" style={{ color: scoreColor }}>
              {healthScore}
            </span>
            <span className="text-xs text-muted-foreground font-medium">/ 100</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-foreground">
            {scans.length === 0
              ? 'Optimal Status'
              : healthScore >= 80
                ? 'Healthy Crop State'
                : 'Attention Required'}
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {scans.length === 0
              ? 'No disease symptoms detected. Scan your crop leaves to monitor crop health.'
              : `${scans.filter((s) => s.severity !== 'low').length} active alerts requiring field management.`}
          </p>
        </div>
      </div>

      {scans.length === 0 ? (
        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Sprout size={14} className="text-primary" /> Ready for your first AI scan
          </span>
          <Link href="/ai-scan" className="btn-primary text-xs px-3 py-1.5 h-8 gap-1">
            <ScanLine size={14} /> Start Scan
          </Link>
        </div>
      ) : (
        <div className="space-y-2 mt-auto pt-2 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground">Recent Scan Breakdown</p>
          {scans.slice(0, 2).map((scan) => (
            <div key={scan.id} className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground truncate max-w-[160px]">
                {scan.crop} — {scan.disease}
              </span>
              <span className="text-muted-foreground">{scan.confidence}% confidence</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

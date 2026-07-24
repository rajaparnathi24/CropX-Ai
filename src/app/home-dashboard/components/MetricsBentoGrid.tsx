'use client';

import React from 'react';
import CropHealthScoreCard from './CropHealthScoreCard';
import WeatherCard from './WeatherCard';
import StatMiniCard from './StatMiniCard';
import { useScans } from '@/context/ScanContext';

export default function MetricsBentoGrid() {
  const { scans, diseaseReports } = useScans();

  const avgConfidence =
    scans.length > 0
      ? (scans.reduce((acc, s) => acc + s.confidence, 0) / scans.length).toFixed(1)
      : '0';

  const miniStats = [
    {
      id: 'stat-active-scans',
      label: 'Total Scans',
      value: String(scans.length),
      unit: scans.length === 1 ? 'scan' : 'scans',
      trend: scans.length === 0 ? 'No scans yet' : 'Real-time history',
      trendUp: scans.length > 0,
      icon: '🔬',
    },
    {
      id: 'stat-diseases',
      label: 'Diseases Logged',
      value: String(diseaseReports.length),
      unit: 'types detected',
      trend: diseaseReports.length === 0 ? 'Clear record' : `${diseaseReports.length} types`,
      trendUp: diseaseReports.length === 0,
      icon: '🦠',
    },
    {
      id: 'stat-confidence',
      label: 'Avg AI Confidence',
      value: avgConfidence,
      unit: '%',
      trend: scans.length === 0 ? 'Awaiting scans' : 'High precision',
      trendUp: true,
      icon: '🎯',
    },
    {
      id: 'stat-treatment',
      label: 'Active Reports',
      value: String(diseaseReports.length),
      unit: 'action items',
      trend: diseaseReports.length === 0 ? 'No alerts' : 'Treatment ready',
      trendUp: diseaseReports.length === 0,
      icon: '💊',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {/* Hero: Crop Health Score */}
      <div className="md:col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
        <CropHealthScoreCard />
      </div>

      {/* Weather Card */}
      <div className="md:col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
        <WeatherCard />
      </div>

      {/* 4 mini stat cards */}
      {miniStats.map((stat) => (
        <StatMiniCard key={stat.id} {...stat} />
      ))}
    </div>
  );
}

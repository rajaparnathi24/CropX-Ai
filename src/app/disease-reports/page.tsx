'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { TrendingUp, AlertTriangle, ScanLine, FileText } from 'lucide-react';
import { useScans } from '@/context/ScanContext';
import Link from 'next/link';

export default function DiseaseReportsPage() {
  const { diseaseReports } = useScans();

  return (
    <AppLayout currentPath="/disease-reports">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="text-primary" /> Disease Analytics & Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Aggregated disease summaries generated dynamically from your active scan history.
          </p>
        </div>

        {diseaseReports.length === 0 ? (
          <div className="card-base p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto text-primary">
              <FileText size={32} />
            </div>
            <h2 className="text-xl font-bold text-foreground">No Disease Reports Available</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Disease reports are generated automatically from your crop scans. Perform your first
              scan to generate real reports.
            </p>
            <Link
              href="/ai-scan"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5"
            >
              <ScanLine size={18} /> Launch AI Scan
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diseaseReports.map((report) => (
              <div key={report.id} className="card-base space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      {report.crop}
                    </span>
                    <h3 className="text-lg font-bold text-foreground">{report.title}</h3>
                  </div>
                  <span className="severity-badge severity-medium">
                    {report.affectedCount} Scan{report.affectedCount > 1 ? 's' : ''} Logged
                  </span>
                </div>

                <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <AlertTriangle size={14} className="text-severity-medium" />
                    <span>Treatment Advice:</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {report.recommendedTreatment}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t border-border flex justify-between">
                  <span>
                    Last Detected: {new Date(report.lastDetected).toLocaleDateString('en-IN')}
                  </span>
                  <Link href="/scan-history" className="text-primary font-semibold hover:underline">
                    View Scans →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

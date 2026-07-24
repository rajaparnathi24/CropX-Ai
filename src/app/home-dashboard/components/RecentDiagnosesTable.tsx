'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Trash2, ScanLine, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import { useScans } from '@/context/ScanContext';
import Link from 'next/link';

const SEVERITY_CONFIG = {
  low: { label: 'Low', class: 'severity-low' },
  medium: { label: 'Medium', class: 'severity-medium' },
  high: { label: 'High', class: 'severity-high' },
  critical: { label: 'Critical', class: 'severity-critical' },
};

type SortKey = 'date' | 'confidence' | 'severity' | 'crop';
type SortDir = 'asc' | 'desc';

const SEVERITY_ORDER = { low: 0, medium: 1, high: 2, critical: 3 };

export default function RecentDiagnosesTable() {
  const { scans, deleteScan } = useScans();
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...scans].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'confidence') cmp = a.confidence - b.confidence;
    else if (sortKey === 'severity')
      cmp =
        SEVERITY_ORDER[a.severity as keyof typeof SEVERITY_ORDER] -
        SEVERITY_ORDER[b.severity as keyof typeof SEVERITY_ORDER];
    else if (sortKey === 'crop') cmp = a.crop.localeCompare(b.crop);
    else cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronDown size={12} className="text-muted-foreground/40" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-primary" />
    ) : (
      <ChevronDown size={12} className="text-primary" />
    );
  };

  if (scans.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Recent Diagnoses</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Clean diagnosis record</p>
          </div>
        </div>

        <div className="card-base p-10 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4 text-primary">
            <Sprout size={28} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">No crop scans recorded yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Upload or capture a crop leaf image to receive an instant AI disease diagnosis and
            severity treatment plan.
          </p>
          <Link href="/ai-scan" className="btn-primary px-5 py-2.5 gap-2">
            <ScanLine size={18} />
            <span>Launch AI Leaf Scan</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Recent Diagnoses</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{scans.length} scans total</p>
        </div>
        <Link href="/ai-scan" className="btn-primary text-xs px-3 py-1.5 gap-1.5">
          <ScanLine size={14} /> New Scan
        </Link>
      </div>

      <div className="card-base p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('crop')}
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                  >
                    Crop <SortIcon k="crop" />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Disease
                  </span>
                </th>
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('confidence')}
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                  >
                    Confidence <SortIcon k="confidence" />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('severity')}
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                  >
                    Severity <SortIcon k="severity" />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Season
                  </span>
                </th>
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                  >
                    Date <SortIcon k="date" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((diag, idx) => {
                const sevConf = SEVERITY_CONFIG[diag.severity as keyof typeof SEVERITY_CONFIG];
                const dateStr = new Date(diag.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <tr
                    key={diag.id}
                    className={`border-b border-border transition-colors duration-150 ${
                      idx % 2 === 0 ? 'hover:bg-muted/40' : 'bg-muted/20 hover:bg-muted/50'
                    }`}
                  >
                    <td className="px-4 py-3.5 font-semibold text-foreground">{diag.crop}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-foreground">
                      {diag.disease}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${diag.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold tabular-nums text-foreground">
                          {diag.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`severity-badge ${sevConf.class}`}>{sevConf.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground font-medium">
                      {diag.season}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-foreground font-medium">{dateStr}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toast.info(`Symptoms: ${diag.symptoms[0]}`)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => {
                            deleteScan(diag.id);
                            toast.success('Scan record deleted');
                          }}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-severity-high"
                          title="Delete Scan"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span> of{' '}
              <span className="font-semibold text-foreground">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs border border-border bg-card hover:bg-muted disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs border border-border bg-card hover:bg-muted disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

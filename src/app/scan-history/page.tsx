'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { History, Search, Trash2, Eye, ScanLine, Filter, Calendar } from 'lucide-react';
import { useScans } from '@/context/ScanContext';
import { ScanRecord } from '@/types';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ScanHistoryPage() {
  const { scans, deleteScan, clearHistory } = useScans();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState('all');
  const [activeScanModal, setActiveScanModal] = useState<ScanRecord | null>(null);

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.district.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCrop =
      selectedCropFilter === 'all' || scan.crop.toLowerCase() === selectedCropFilter.toLowerCase();
    const matchesSeason = selectedSeasonFilter === 'all' || scan.season === selectedSeasonFilter;

    return matchesSearch && matchesCrop && matchesSeason;
  });

  const uniqueCrops = Array.from(new Set(scans.map((s) => s.crop)));

  return (
    <AppLayout currentPath="/scan-history">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <History className="text-primary" /> Scan History
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Review all past crop diagnoses, confidence metrics, and localized field history.
            </p>
          </div>
          {scans.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all scan history?')) {
                  clearHistory();
                  toast.success('Scan history cleared');
                }
              }}
              className="btn-ghost text-xs text-severity-high hover:bg-severity-high/10 self-start md:self-auto"
            >
              Clear All History
            </button>
          )}
        </div>

        {/* Filter controls */}
        {scans.length > 0 && (
          <div className="card-base p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-6 relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by crop, disease, or district..."
                className="input-field pl-10"
              />
            </div>

            <div className="md:col-span-3">
              <div className="relative">
                <Filter
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <select
                  value={selectedCropFilter}
                  onChange={(e) => setSelectedCropFilter(e.target.value)}
                  className="input-field pl-8 text-xs cursor-pointer"
                >
                  <option value="all">All Crops ({uniqueCrops.length})</option>
                  {uniqueCrops.map((crop) => (
                    <option key={`filter-crop-${crop}`} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <select
                  value={selectedSeasonFilter}
                  onChange={(e) => setSelectedSeasonFilter(e.target.value)}
                  className="input-field pl-8 text-xs cursor-pointer"
                >
                  <option value="all">All Indian Seasons</option>
                  <option value="Kharif">Kharif Season</option>
                  <option value="Rabi">Rabi Season</option>
                  <option value="Zaid">Zaid Season</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {scans.length === 0 && (
          <div className="card-base p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto text-primary">
              <History size={32} />
            </div>
            <h2 className="text-xl font-bold text-foreground">No Crop Scans Found</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              You haven&apos;t run any crop disease scans yet. Perform an AI scan to save your field
              records.
            </p>
            <Link
              href="/ai-scan"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5"
            >
              <ScanLine size={18} /> Run First AI Scan
            </Link>
          </div>
        )}

        {/* Scan Cards List */}
        {scans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScans.map((scan) => {
              const dateFormatted = new Date(scan.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div key={scan.id} className="card-base flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Image preview */}
                    <div className="relative h-44 rounded-xl overflow-hidden bg-muted">
                      <img
                        src={scan.imageUrl}
                        alt={scan.crop}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 severity-badge severity-medium">
                        {scan.severity.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-foreground">{scan.crop}</h3>
                        <span className="text-xs font-bold text-primary tabular-nums">
                          {scan.confidence}% AI Match
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-severity-high mt-0.5">
                        {scan.disease}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {scan.district}, {scan.state} · Season: {scan.season}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{dateFormatted}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveScanModal(scan)}
                        className="btn-secondary text-xs px-3 py-1.5 gap-1"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => {
                          deleteScan(scan.id);
                          toast.success('Scan removed from history');
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-severity-high hover:bg-muted"
                        title="Delete Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Scan Details Modal */}
        {activeScanModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-base max-w-lg w-full space-y-4 fade-in-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-bold text-foreground">
                  {activeScanModal.crop} — {activeScanModal.disease}
                </h3>
                <button
                  onClick={() => setActiveScanModal(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-bold px-2"
                >
                  ✕
                </button>
              </div>

              <img
                src={activeScanModal.imageUrl}
                alt={activeScanModal.crop}
                className="w-full h-48 object-cover rounded-xl border border-border"
              />

              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                    Symptoms
                  </h4>
                  <p className="text-xs text-foreground mt-1">
                    {activeScanModal.symptoms.join(', ')}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                    Recommended Treatment
                  </h4>
                  <p className="text-xs text-foreground font-medium mt-1">
                    {activeScanModal.recommendations.join('. ')}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <button
                  onClick={() => setActiveScanModal(null)}
                  className="btn-primary text-xs px-4 py-2"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

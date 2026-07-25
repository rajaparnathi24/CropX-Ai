'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Sprout,
  Bug,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
  FileText,
  CloudSun,
  History,
  CornerDownLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DISEASES_LIST, CROPS_SEARCH_LIST, DiseaseItem, CropItem } from '@/constants/diseasesData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'crops' | 'diseases'>('all');
  const [selectedDisease, setSelectedDisease] = useState<DiseaseItem | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open search modal handled parentally or here
        }
      }
      if (e.key === 'Escape') {
        if (selectedDisease || selectedCrop) {
          setSelectedDisease(null);
          setSelectedCrop(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedDisease, selectedCrop]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedDisease(null);
      setSelectedCrop(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Filter crops
  const filteredCrops = CROPS_SEARCH_LIST.filter(
    (c) =>
      c.name.toLowerCase().includes(normalizedQuery) ||
      c.hindiName.toLowerCase().includes(normalizedQuery) ||
      c.gujaratiName.toLowerCase().includes(normalizedQuery) ||
      c.category.toLowerCase().includes(normalizedQuery)
  );

  // Filter diseases
  const filteredDiseases = DISEASES_LIST.filter(
    (d) =>
      d.name.toLowerCase().includes(normalizedQuery) ||
      d.crop.toLowerCase().includes(normalizedQuery) ||
      d.raw.toLowerCase().includes(normalizedQuery) ||
      d.symptoms.some((s) => s.toLowerCase().includes(normalizedQuery))
  );

  // Quick actions list
  const quickActions = [
    {
      title: 'AI Crop Disease Diagnosis',
      description: 'Upload leaf photo to diagnose 57+ plant diseases with ensemble AI',
      icon: Stethoscope,
      href: '/ai-diagnosis',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Scan History & Reports',
      description: 'View previous field diagnostic logs, treatment recommendations and history',
      icon: History,
      href: '/scan-history',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Weather Advisory & Forecast',
      description: 'Check district-level humidity, rain and monsoon warnings for your farm',
      icon: CloudSun,
      href: '/weather',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  const handleSelectCrop = (cropName: string) => {
    onClose();
    router.push(`/ai-diagnosis?crop=${encodeURIComponent(cropName)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-20 px-4 sm:px-6 bg-slate-950/60 backdrop-blur-md transition-all animate-fadeIn">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Command Palette Dialog Container */}
      <div className="relative w-full max-w-3xl rounded-3xl bg-card border border-border/80 shadow-2xl shadow-emerald-950/20 overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Search Bar Input Header */}
        <div className="relative flex items-center px-5 py-4 border-b border-border/70 bg-gradient-to-r from-emerald-50/50 via-card to-card dark:from-emerald-950/20 dark:via-card dark:to-card">
          <Search size={22} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mr-3.5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search crops (e.g. Cotton, Tomato), diseases (e.g. Blight, Rust)..."
            className="w-full text-base font-medium bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/70"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mr-2"
            >
              <X size={18} />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors border border-border"
          >
            ESC
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border/60 bg-muted/30 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
            }`}
          >
            <Sparkles size={13} />
            <span>All Results</span>
          </button>

          <button
            onClick={() => setActiveTab('crops')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'crops'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
            }`}
          >
            <Sprout size={13} />
            <span>Crops ({filteredCrops.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('diseases')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'diseases'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
            }`}
          >
            <Bug size={13} />
            <span>Diseases ({filteredDiseases.length})</span>
          </button>
        </div>

        {/* Modal Body / Results */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 divide-y divide-border/50 custom-scrollbar">
          {/* CROPS SECTION */}
          {(activeTab === 'all' || activeTab === 'crops') && filteredCrops.length > 0 && (
            <div className="pt-2 first:pt-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sprout size={14} />
                  Supported Crops ({filteredCrops.length})
                </span>
                <span className="text-xs text-muted-foreground">Click crop to start diagnosis</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredCrops.map((crop) => (
                  <div
                    key={crop.id}
                    onClick={() => handleSelectCrop(crop.name)}
                    className="group p-3 rounded-2xl border border-border bg-card hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                        🌾
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {crop.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {crop.hindiName} • {crop.diseaseCount} Diseases
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DISEASES SECTION */}
          {(activeTab === 'all' || activeTab === 'diseases') && filteredDiseases.length > 0 && (
            <div className="pt-4 first:pt-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Bug size={14} />
                  Plant Diseases & Conditions ({filteredDiseases.length})
                </span>
                <span className="text-xs text-muted-foreground">Click for treatment & details</span>
              </div>
              <div className="space-y-2">
                {filteredDiseases.map((disease) => (
                  <div
                    key={disease.id}
                    onClick={() => setSelectedDisease(disease)}
                    className="group p-3.5 rounded-2xl border border-border bg-card hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          disease.severity === 'critical'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : disease.severity === 'medium'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {disease.crop.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {disease.name}
                          </p>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              disease.severity === 'critical'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                                : disease.severity === 'medium'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            }`}
                          >
                            {disease.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {disease.symptoms[0] || `Affects ${disease.crop} crops`}
                        </p>
                      </div>
                    </div>

                    <button className="text-xs font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1 flex-shrink-0">
                      <span>View</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUICK ACTIONS SECTION */}
          {activeTab === 'all' && !normalizedQuery && (
            <div className="pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-3 px-1">
                <Sparkles size={14} />
                Quick Actions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {quickActions.map((action, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleNavigate(action.href)}
                    className="p-3.5 rounded-2xl border border-border bg-card hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      <div className={`w-9 h-9 rounded-xl ${action.color} flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform`}>
                        <action.icon size={18} />
                      </div>
                      <h4 className="font-semibold text-sm text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Open</span>
                      <CornerDownLeft size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NO RESULTS FOUND */}
          {filteredCrops.length === 0 && filteredDiseases.length === 0 && (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <Search size={24} />
              </div>
              <h3 className="text-base font-bold text-foreground">No matching crops or diseases found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Try searching for crop names like "Cotton", "Tomato", "Wheat" or diseases like "Blight", "Rust", "Mosaic".
              </p>
              <button
                onClick={() => handleNavigate('/ai-diagnosis')}
                className="mt-4 inline-flex items-center gap-2 btn-primary text-xs px-4 py-2"
              >
                <Stethoscope size={14} />
                <span>Upload Leaf for AI Diagnosis</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/40 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px] font-mono">⌘K</kbd> / <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px] font-mono">Ctrl+K</kbd> to toggle
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px] font-mono">ESC</kbd> to close
            </span>
          </div>
          <span className="font-medium text-emerald-700 dark:text-emerald-400">CropX AI Engine v1.0</span>
        </div>
      </div>

      {/* DISEASE DETAIL MODAL / DRAWER */}
      {selectedDisease && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-border">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {selectedDisease.crop} Disease Overview
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{selectedDisease.name}</h3>
              </div>
              <button
                onClick={() => setSelectedDisease(null)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm">
              {/* Severity badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Severity Level:</span>
                <span
                  className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-xs ${
                    selectedDisease.severity === 'critical'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                      : selectedDisease.severity === 'medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                  }`}
                >
                  {selectedDisease.severity} Risk
                </span>
              </div>

              {/* Symptoms */}
              {selectedDisease.symptoms.length > 0 && (
                <div className="rounded-2xl p-3.5 bg-muted/40 border border-border space-y-1.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-500" />
                    Key Symptoms
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {selectedDisease.symptoms.map((sym, i) => (
                      <li key={i}>{sym}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {selectedDisease.recommendations.length > 0 && (
                <div className="rounded-2xl p-3.5 bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Stethoscope size={14} />
                    Recommended Treatment & Actions
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {selectedDisease.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preventive Measures */}
              {selectedDisease.preventiveMeasures.length > 0 && (
                <div className="rounded-2xl p-3.5 bg-blue-500/10 border border-blue-500/20 space-y-1.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    <ShieldCheck size={14} />
                    Preventive Measures
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {selectedDisease.preventiveMeasures.map((prev, i) => (
                      <li key={i}>{prev}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedDisease(null)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedDisease(null);
                  handleSelectCrop(selectedDisease.crop);
                }}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <Stethoscope size={14} />
                <span>Diagnose {selectedDisease.crop} Leaf</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

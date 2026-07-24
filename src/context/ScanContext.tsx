'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ScanRecord, DiseaseReport } from '@/types';
import { useAuth } from './AuthContext';

interface ScanContextType {
  scans: ScanRecord[];
  diseaseReports: DiseaseReport[];
  isLoading: boolean;
  addScan: (scan: Omit<ScanRecord, 'id' | 'userId' | 'date'>) => Promise<ScanRecord>;
  deleteScan: (scanId: string) => void;
  clearHistory: () => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [diseaseReports, setDiseaseReports] = useState<DiseaseReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getStorageKey = useCallback(() => {
    return user ? `cropx_scans_${user.id}` : 'cropx_scans_guest';
  }, [user]);

  // Load scans from localStorage for current active user
  useEffect(() => {
    setIsLoading(true);
    try {
      const key = getStorageKey();
      const stored = localStorage.getItem(key);
      if (stored) {
        setScans(JSON.parse(stored));
      } else {
        setScans([]);
      }
    } catch {
      setScans([]);
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey]);

  // Recalculate disease reports derived dynamically from actual scans
  useEffect(() => {
    if (scans.length === 0) {
      setDiseaseReports([]);
      return;
    }

    const reportMap = new Map<string, DiseaseReport>();

    scans.forEach((scan) => {
      const reportKey = `${scan.crop}-${scan.disease}`;
      const existing = reportMap.get(reportKey);

      if (existing) {
        existing.affectedCount += 1;
        if (new Date(scan.date) > new Date(existing.lastDetected)) {
          existing.lastDetected = scan.date;
        }
      } else {
        reportMap.set(reportKey, {
          id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: scan.disease,
          crop: scan.crop,
          severity: scan.severity,
          affectedCount: 1,
          lastDetected: scan.date,
          recommendedTreatment:
            scan.recommendations[0] || 'Consult local krishi vigyan kendra officer.',
        });
      }
    });

    setDiseaseReports(Array.from(reportMap.values()));
  }, [scans]);

  const addScan = async (
    newScanData: Omit<ScanRecord, 'id' | 'userId' | 'date'>
  ): Promise<ScanRecord> => {
    const createdScan: ScanRecord = {
      ...newScanData,
      id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: user?.id || 'guest',
      date: new Date().toISOString(),
    };

    const updatedScans = [createdScan, ...scans];
    setScans(updatedScans);

    try {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(updatedScans));
    } catch {
      console.error('Failed to persist scan record');
    }

    return createdScan;
  };

  const deleteScan = (scanId: string) => {
    const updatedScans = scans.filter((s) => s.id !== scanId);
    setScans(updatedScans);
    try {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(updatedScans));
    } catch {
      console.error('Failed to update scans storage');
    }
  };

  const clearHistory = () => {
    setScans([]);
    try {
      const key = getStorageKey();
      localStorage.removeItem(key);
    } catch {
      console.error('Failed to clear scan history');
    }
  };

  return (
    <ScanContext.Provider
      value={{
        scans,
        diseaseReports,
        isLoading,
        addScan,
        deleteScan,
        clearHistory,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScans() {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScans must be used within a ScanProvider');
  }
  return context;
}

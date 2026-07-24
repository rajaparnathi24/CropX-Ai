'use client';

import React from 'react';
import { ScanLine, Zap } from 'lucide-react';
import Link from 'next/link';

export default function QuickScanButton() {
  return (
    <div className="fixed bottom-20 lg:bottom-8 right-6 z-30">
      <Link
        href="/ai-scan"
        className="flex items-center gap-2.5 rounded-full gradient-green text-white font-bold px-5 py-4 card-shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <div className="relative">
          <ScanLine size={22} />
          <Zap size={10} className="absolute -top-1 -right-1 text-yellow-300" />
        </div>
        <span className="text-sm font-bold hidden sm:block">AI Scan</span>
      </Link>
    </div>
  );
}

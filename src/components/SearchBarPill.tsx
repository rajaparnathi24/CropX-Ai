'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SearchModal from './SearchModal';

interface SearchBarPillProps {
  className?: string;
  placeholder?: string;
}

export default function SearchBarPill({
  className = '',
  placeholder = 'Search crops, diseases...',
}: SearchBarPillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Pill Search Trigger Button matching user design */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group relative flex items-center justify-between gap-3 rounded-full bg-[#eaf5eb] dark:bg-emerald-950/40 hover:bg-[#dfefe0] dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/60 px-4 py-2 text-sm transition-all shadow-sm hover:shadow-md cursor-pointer select-none text-emerald-900 dark:text-emerald-200 ${className}`}
        aria-label="Search crops and diseases"
      >
        {/* Left Search Icon */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Search
            size={17}
            className="text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0"
          />
          {/* Centered Placeholder text */}
          <span className="font-medium text-emerald-800/90 dark:text-emerald-200/90 truncate">
            {placeholder}
          </span>
        </div>

        {/* Right ⌘K / Ctrl+K badge */}
        <div className="flex items-center gap-0.5 text-xs font-mono font-medium text-emerald-700/90 dark:text-emerald-400/90 bg-emerald-100/70 dark:bg-emerald-900/60 border border-emerald-300/60 dark:border-emerald-700/60 rounded-md px-1.5 py-0.5 flex-shrink-0 group-hover:border-emerald-400 transition-colors">
          <span>{isMac ? '⌘' : 'Ctrl+'}</span>
          <span>K</span>
        </div>
      </button>

      {/* Command Palette Modal */}
      <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

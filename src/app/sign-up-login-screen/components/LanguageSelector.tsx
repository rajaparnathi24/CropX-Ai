'use client';

import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import type { Language } from './AuthScreen';

interface LanguageSelectorProps {
  language: Language;
  onChange: (lang: Language) => void;
}

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
];

export default function LanguageSelector({ language, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === language)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-all duration-150"
      >
        <Globe size={14} className="text-muted-foreground" />
        <span>{current.native}</span>
        <ChevronDown
          size={12}
          className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-border bg-card card-shadow z-50 py-1 overflow-hidden">
          {LANGUAGES.map((lang) => (
            <button
              key={`lang-${lang.code}`}
              onClick={() => {
                onChange(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-muted ${
                language === lang.code ? 'text-primary font-semibold' : 'text-foreground'
              }`}
            >
              <span>{lang.native}</span>
              {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

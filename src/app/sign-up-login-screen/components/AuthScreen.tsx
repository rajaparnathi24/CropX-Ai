'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AuthBrandPanel from './AuthBrandPanel';
import LanguageSelector from './LanguageSelector';

export type AuthMode = 'login' | 'register';
export type Language = 'en' | 'hi' | 'gu';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [language, setLanguage] = useState<Language>('en');

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        <AuthBrandPanel />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl gradient-green flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z"
                  fill="white"
                />
                <path
                  d="M7 7C8.5 5 10.5 4 12 4c3 0 6 2 7 5-1.5-1.5-4-2-6-1.5C11 8 9 9 7 7z"
                  fill="rgba(255,255,255,0.7)"
                />
              </svg>
            </div>
            <span className="font-bold text-lg text-primary">CropX</span>
          </div>
          <div className="ml-auto">
            <LanguageSelector language={language} onChange={setLanguage} />
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            {/* Mode toggle */}
            <div className="flex rounded-2xl bg-muted p-1 mb-8 gap-1">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-card text-primary card-shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                  mode === 'register'
                    ? 'bg-card text-primary card-shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Create Account
              </button>
            </div>

            {mode === 'login' ? (
              <LoginForm language={language} onSwitchMode={() => setMode('register')} />
            ) : (
              <RegisterForm language={language} onSwitchMode={() => setMode('login')} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to CropX&apos;s{' '}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Settings, Globe, Moon, Sun, Bell, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [language, setLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [apiUrl, setApiUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
  );

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement?.classList?.toggle('dark');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully');
  };

  return (
    <AppLayout currentPath="/settings">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="text-primary" /> Application Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure theme, local language preferences, and backend API service connection.
          </p>
        </div>

        <form onSubmit={handleSave} className="card-base space-y-6">
          {/* Language Preference */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Globe size={16} className="text-primary" /> Preferred Language
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'हिंदी (Hindi)' },
                { id: 'gu', label: 'ગુજરાતી (Gujarati)' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id)}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                    language === lang.id
                      ? 'border-primary bg-accent text-primary'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme & Notifications */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {darkMode ? (
                    <Sun size={16} className="text-secondary" />
                  ) : (
                    <Moon size={16} className="text-primary" />
                  )}
                  Theme Mode
                </p>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark mode aesthetic
                </p>
              </div>
              <button
                type="button"
                onClick={toggleDark}
                className="btn-secondary text-xs px-3.5 py-1.5"
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Bell size={16} className="text-primary" /> Disease Outbreak Alerts
                </p>
                <p className="text-xs text-muted-foreground">
                  Receive browser notifications for local crop outbreaks
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Backend API Configuration */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Database size={16} className="text-primary" /> FastAPI Backend Service Endpoint
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure the base URL of your FastAPI backend service (defaults to
              http://localhost:8000/api/v1).
            </p>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="input-field font-mono text-xs"
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button type="submit" className="btn-primary text-xs px-4 py-2">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

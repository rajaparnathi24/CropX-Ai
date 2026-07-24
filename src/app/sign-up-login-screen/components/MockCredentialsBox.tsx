'use client';

import React, { useState } from 'react';
import { Copy, Check, Info } from 'lucide-react';
import { toast } from 'sonner';

interface MockCredentialsBoxProps {
  email: string;
  password: string;
  onFill: () => void;
}

export default function MockCredentialsBox({ email, password, onFill }: MockCredentialsBoxProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copy = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="mt-6 rounded-2xl border border-primary/20 bg-accent p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
          <Info size={12} className="text-primary" />
        </div>
        <p className="text-xs font-semibold text-primary">Demo Account</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-xl bg-card border border-border px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Email</p>
            <p className="text-xs font-semibold text-foreground truncate">{email}</p>
          </div>
          <button
            onClick={() => copy(email, 'Email')}
            className="ml-2 flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            {copiedField === 'Email' ? (
              <Check size={13} className="text-severity-low" />
            ) : (
              <Copy size={13} className="text-muted-foreground" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-card border border-border px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Password</p>
            <p className="text-xs font-semibold text-foreground">{password}</p>
          </div>
          <button
            onClick={() => copy(password, 'Password')}
            className="ml-2 flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            {copiedField === 'Password' ? (
              <Check size={13} className="text-severity-low" />
            ) : (
              <Copy size={13} className="text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      <button
        onClick={onFill}
        className="mt-3 w-full rounded-xl bg-primary/10 text-primary text-xs font-semibold py-2 hover:bg-primary/20 transition-colors"
      >
        Auto-fill credentials
      </button>
    </div>
  );
}

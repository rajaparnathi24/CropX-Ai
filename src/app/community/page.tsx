'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, MessageSquare, Sprout } from 'lucide-react';

export default function CommunityPage() {
  return (
    <AppLayout currentPath="/community">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="text-primary" /> Indian Farmer Community
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Connect, share agricultural insights, and discuss crop remedies with local farmers
            across India.
          </p>
        </div>

        <div className="card-base p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto text-primary">
            <MessageSquare size={32} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Community Forum Coming Soon</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The community discussion forum will be enabled automatically once your FastAPI backend
            community service is connected.
          </p>
          <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-xl text-xs text-muted-foreground font-mono">
            <Sprout size={14} className="text-primary" /> API Endpoint: GET /api/v1/community/posts
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

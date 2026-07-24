'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { User as UserIcon, MapPin, Mail, Save, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INDIAN_STATES_DISTRICTS } from '@/constants/indianStates';
import { INDIAN_CROPS } from '@/constants/crops';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [state, setState] = useState(user?.state || 'Gujarat');
  const [district, setDistrict] = useState(user?.district || 'Anand');
  const [primaryCrop, setPrimaryCrop] = useState(user?.primaryCrop || 'Rice');

  const currentDistricts = INDIAN_STATES_DISTRICTS.find((s) => s.state === state)?.districts || [];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      email,
      state,
      district,
      primaryCrop,
    });
    toast.success('Profile updated successfully 🌿');
  };

  const handleSignOut = () => {
    logout();
    router.push('/sign-up-login-screen');
  };

  return (
    <AppLayout currentPath="/profile">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <UserIcon className="text-primary" /> Farmer Profile
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your personal farm details, localized state/district location, and crop
              preferences.
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="btn-ghost text-xs text-severity-high hover:bg-severity-high/10 gap-1.5"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <form onSubmit={handleSave} className="card-base space-y-5">
          {/* User Header Badge */}
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="w-14 h-14 rounded-full gradient-green flex items-center justify-center text-white font-bold text-xl">
              {fullName ? fullName.charAt(0).toUpperCase() : 'F'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{fullName || 'Farmer'}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin size={12} className="text-primary" /> {district}, {state}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                State
              </label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  const newDists =
                    INDIAN_STATES_DISTRICTS.find((s) => s.state === e.target.value)?.districts ||
                    [];
                  if (newDists.length > 0) setDistrict(newDists[0]);
                }}
                className="input-field cursor-pointer"
              >
                {INDIAN_STATES_DISTRICTS.map((item) => (
                  <option key={`prof-state-${item.state}`} value={item.state}>
                    {item.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="input-field cursor-pointer"
              >
                {currentDistricts.map((dist) => (
                  <option key={`prof-dist-${dist}`} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Primary Crop Focus
              </label>
              <select
                value={primaryCrop}
                onChange={(e) => setPrimaryCrop(e.target.value)}
                className="input-field cursor-pointer"
              >
                {INDIAN_CROPS.map((crop) => (
                  <option key={`prof-crop-${crop.id}`} value={crop.name.split(' (')[0]}>
                    {crop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button type="submit" className="btn-primary px-5 py-2.5 gap-2 text-sm">
              <Save size={16} /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

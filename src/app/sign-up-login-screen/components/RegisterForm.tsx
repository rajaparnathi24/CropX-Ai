'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  MapPin,
  Loader2,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { INDIAN_STATES_DISTRICTS } from '@/constants/indianStates';
import type { Language } from './AuthScreen';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  state: string;
  district: string;
}

interface RegisterFormProps {
  language: Language;
  onSwitchMode: () => void;
}

export default function RegisterForm({ onSwitchMode }: RegisterFormProps) {
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('Gujarat');
  const router = useRouter();

  const currentDistricts =
    INDIAN_STATES_DISTRICTS.find((s) => s.state === selectedState)?.districts || [];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      state: 'Gujarat',
      district: 'Anand',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const success = await signup({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        state: data.state,
        district: data.district,
      });

      if (success) {
        toast.success(`Welcome to CropX, ${data.fullName}! 🌾`, {
          description: 'Your account has been created successfully.',
        });
        router.push('/home-dashboard');
      } else {
        toast.error('An account with this email address already exists');
      }
    } catch {
      toast.error('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Create your CropX account</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Join farmers across India protecting their harvest with AI
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              {...register('fullName', { required: 'Your full name is required' })}
              type="text"
              placeholder="e.g. Amit Sharma"
              className="input-field pl-10"
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-severity-high">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
              type="email"
              placeholder="farmer@example.com"
              className="input-field pl-10"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-severity-high">{errors.email.message}</p>
          )}
        </div>

        {/* Location (State & District) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">State</label>
            <div className="relative">
              <MapPin
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <select
                {...register('state', { required: 'Select your state' })}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                }}
                className="input-field pl-8 appearance-none cursor-pointer text-xs"
              >
                {INDIAN_STATES_DISTRICTS.map((item) => (
                  <option key={`state-${item.state}`} value={item.state}>
                    {item.state}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">District</label>
            <div className="relative">
              <select
                {...register('district', { required: 'Select your district' })}
                className="input-field appearance-none pr-8 cursor-pointer text-xs"
              >
                {currentDistricts.map((dist) => (
                  <option key={`dist-${dist}`} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className="input-field pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-severity-high">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              className="input-field pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-severity-high">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="btn-primary w-full h-14 text-base mt-2">
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              Create Account <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-5">
        Already have an account?{' '}
        <button onClick={onSwitchMode} className="text-primary font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}

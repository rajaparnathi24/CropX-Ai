'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import type { Language } from './AuthScreen';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  language: Language;
  onSwitchMode: () => void;
}

const LABELS = {
  en: {
    title: 'Welcome back',
    subtitle: 'Sign in to your CropX account',
    email: 'Email Address',
    password: 'Password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    signin: 'Sign In',
    guest: 'Continue as Guest',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
  },
  hi: {
    title: 'वापस स्वागत है',
    subtitle: 'अपने CropX खाते में साइन इन करें',
    email: 'ईमेल पता',
    password: 'पासवर्ड',
    remember: 'मुझे याद रखें',
    forgot: 'पासवर्ड भूल गए?',
    signin: 'साइन इन करें',
    guest: 'अतिथि के रूप में जारी रखें',
    noAccount: 'खाता नहीं है?',
    signUp: 'साइन अप',
  },
  gu: {
    title: 'પાછા સ્વાગત છે',
    subtitle: 'તમારા CropX ખાતામાં સાઇન ઇન કરો',
    email: 'ઇમેઇલ સરનામું',
    password: 'પાસવર્ડ',
    remember: 'મને યાદ રાખો',
    forgot: 'પાસવર્ડ ભૂલ્યા?',
    signin: 'સાઇન ઇન',
    guest: 'અતિથિ તરીકે ચાલુ રાખો',
    noAccount: 'ખાતું નથી?',
    signUp: 'સાઇન અપ',
  },
};

export default function LoginForm({ language, onSwitchMode }: LoginFormProps) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = LABELS[language];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success('Signed in successfully 🌿');
        router.push('/home-dashboard');
      } else {
        toast.error('Invalid email or password. If you are new, please create an account.');
      }
    } catch {
      toast.error('Authentication failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">{t.email}</label>
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

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-foreground">{t.password}</label>
          </div>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              {...register('password', {
                required: 'Password is required',
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
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

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            {...register('rememberMe')}
            type="checkbox"
            id="rememberMe"
            className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
          />
          <label
            htmlFor="rememberMe"
            className="text-sm text-muted-foreground cursor-pointer select-none"
          >
            {t.remember}
          </label>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="btn-primary w-full h-14 text-base">
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              {t.signin}
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Guest mode */}
        <button
          type="button"
          onClick={() => {
            toast.info('Exploring as Guest');
            router.push('/home-dashboard');
          }}
          className="btn-secondary w-full h-12"
        >
          {t.guest}
        </button>
      </form>

      {/* Switch mode */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        {t.noAccount}{' '}
        <button onClick={onSwitchMode} className="text-primary font-semibold hover:underline">
          {t.signUp}
        </button>
      </p>
    </div>
  );
}

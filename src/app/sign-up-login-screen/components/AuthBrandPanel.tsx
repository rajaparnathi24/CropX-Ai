import React from 'react';

export default function AuthBrandPanel() {
  const stats = [
    { value: '2.4M+', label: 'Diagnoses Made' },
    { value: '98.2%', label: 'Accuracy Rate' },
    { value: '40+', label: 'Crop Diseases' },
  ];

  const features = [
    { icon: '🌿', text: 'AI-powered disease detection in seconds' },
    { icon: '💊', text: 'Chemical & organic treatment plans' },
    { icon: '🌦️', text: 'Weather-integrated risk forecasting' },
    { icon: '👨‍🌾', text: 'Farmer community support' },
  ];

  return (
    <div className="w-full h-full gradient-green flex flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 blob-primary opacity-40" />
      <div className="absolute bottom-20 left-0 w-64 h-64 blob-primary opacity-30" />
      {/* Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 4C10 4 5 8 4 14c2-2 5-3 8-2 2.5 0.8 4 3 6 4 3 1.5 6 0.5 8-1.5C25 9 21 4 16 4z"
                fill="rgba(255,255,255,0.9)"
              />
              <path
                d="M16 10c-3 0-6 2-7 5 1.5-1 3.5-1.5 5-0.5 1.5 0.8 2.5 2.5 4 3 2 0.8 4 0 5-1.5-1-3.5-4-6-7-6z"
                fill="rgba(255,255,255,0.6)"
              />
              <path
                d="M16 16v12"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-2xl tracking-tight">CropX</p>
            <p className="text-white/70 text-xs font-medium">AI Crop Health Platform</p>
          </div>
        </div>

        <h1 className="text-white font-bold text-3xl xl:text-4xl leading-tight mb-4">
          Protect your harvest
          <br />
          with AI precision
        </h1>
        <p className="text-white/80 text-base leading-relaxed max-w-sm">
          Diagnose crop diseases instantly, get localized treatment plans, and predict disease
          spread before it affects your yield.
        </p>
      </div>
      {/* Stats */}
      <div className="relative z-10 grid grid-cols-3 gap-4 my-8">
        {stats?.map((stat) => (
          <div
            key={`stat-${stat?.label}`}
            className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center"
          >
            <p className="text-white font-bold text-xl tabular-nums">{stat?.value}</p>
            <p className="text-white/70 text-xs mt-1">{stat?.label}</p>
          </div>
        ))}
      </div>
      {/* Features */}
      <div className="relative z-10 space-y-3">
        {features?.map((feature) => (
          <div key={`feature-${feature?.text?.slice(0, 20)}`} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg flex-shrink-0">
              {feature?.icon}
            </div>
            <p className="text-white/90 text-sm font-medium">{feature?.text}</p>
          </div>
        ))}
      </div>
      {/* Bottom trust badge */}
      <div className="relative z-10 mt-8 flex items-center gap-2">
        <div className="flex -space-x-2">
          {['👨‍🌾', '👩‍🌾', '🧑‍🌾', '👴']?.map((emoji, i) => (
            <div
              key={`farmer-${i}`}
              className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-sm"
            >
              {emoji}
            </div>
          ))}
        </div>
        <p className="text-white/80 text-xs">
          Trusted by <span className="font-semibold text-white">50,000+</span> farmers across India
        </p>
      </div>
    </div>
  );
}

'use client';

import React, { memo } from 'react';
import { Sprout } from 'lucide-react';

interface AppLogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

const AppLogo = memo(function AppLogo({ size = 32, className = '', onClick }: AppLogoProps) {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
    >
      <div
        className="rounded-xl gradient-green flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ width: size, height: size }}
      >
        <Sprout size={size * 0.55} className="text-white" />
      </div>
    </div>
  );
});

AppLogo.displayName = 'AppLogo';

export default AppLogo;

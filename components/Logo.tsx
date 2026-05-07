'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'principal' | 'horizontal' | 'icon';
  color?: 'default' | 'monochrome-black' | 'monochrome-white';
}

export const IZIPISLogo: React.FC<LogoProps> = ({ 
  className = "", 
  variant = 'principal',
  color = 'default'
}) => {
  const sizes = {
    icon: 'w-10 h-10',
    horizontal: 'h-8 w-auto min-w-[100px]',
    principal: 'w-24 h-24'
  };

  const selectedSize = sizes[variant] || sizes.principal;

  // Map color to hex or CSS variable
  const getBgColor = () => {
    if (color === 'monochrome-white') return '#FFFFFF';
    if (color === 'monochrome-black') return '#000000';
    return '#0D3335'; // The "green" brand color
  };

  // We use mask-image to allow dynamic coloring of the SVG
  return (
    <div 
      className={cn(
        "relative", 
        selectedSize, 
        className
      )}
      style={{
        backgroundColor: getBgColor(),
        WebkitMaskImage: 'url(/logo.svg)',
        maskImage: 'url(/logo.svg)',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  );
};

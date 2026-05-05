import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  disabled,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-white/10',
    outline: 'border border-border bg-transparent hover:bg-white/5',
    ghost: 'bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground',
    danger: 'bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm font-bold rounded-xl',
    lg: 'px-6 py-3.5 text-base font-bold rounded-2xl',
    icon: 'p-2 rounded-xl',
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'outline' | 'flat';
}

export function Card({ className, variant = 'glass', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        variant === 'glass' && 'bg-white border border-primary/10',
        variant === 'outline' && 'border border-primary/10 bg-transparent',
        variant === 'flat' && 'bg-primary/5',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-8 border-b border-primary/5', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-8', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-8 border-t border-primary/5', className)} {...props} />;
}

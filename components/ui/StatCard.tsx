import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from './Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ 
  label, 
  value, 
  trend, 
  isPositive, 
  icon: Icon,
  iconColor = 'text-primary'
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-start">
          <div className={cn("p-2 rounded-xl bg-primary/5", iconColor)}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center text-xs font-bold px-2 py-1 rounded-full",
              isPositive ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"
            )}>
              {trend}
              {isPositive ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

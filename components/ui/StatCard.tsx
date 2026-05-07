import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full group hover:border-primary/30 border-primary/10 transition-all">
        <CardContent className="space-y-4">
          <div className="flex justify-between items-start">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              "bg-primary/5 group-hover:bg-primary group-hover:text-white",
              iconColor
            )}>
              <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
            </div>
            {trend && (
              <div className={cn(
                "flex items-center text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest",
                isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              )}>
                {trend}
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 ml-1" /> : <ArrowDownRight className="w-3.5 h-3.5 ml-1" />}
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl font-black text-primary tracking-tight leading-none tabular-nums">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

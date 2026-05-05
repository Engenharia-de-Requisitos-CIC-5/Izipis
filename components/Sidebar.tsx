'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IZIPISLogo } from './Logo';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Estoque', href: '/admin/inventory' },
  { icon: ShoppingCart, label: 'Vendas', href: '/admin/sales' },
  { icon: BarChart3, label: 'Relatórios', href: '/admin/reports' },
  { icon: BrainCircuit, label: 'ML Insights', href: '/admin/ml', isNew: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);


  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="h-screen bg-primary border-r border-white/5 flex flex-col relative sticky top-0 shadow-2xl"
    >
      <div className="p-6 flex items-center gap-3">
        <IZIPISLogo variant={isCollapsed ? 'icon' : 'horizontal'} color="monochrome-white" className="transition-all" />
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer group relative",
                  isActive 
                    ? "bg-secondary text-white shadow-xl shadow-black/20" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5 min-w-[20px]", isActive ? "text-white" : "text-white/40")} />
                {!isCollapsed && (
                  <span className="font-heading font-bold text-sm uppercase tracking-tight">{item.label}</span>
                )}
                {!isCollapsed && item.isNew && (
                  <span className="ml-auto text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
                    NEW
                  </span>
                )}
                
                {isCollapsed && (
                  <div className="absolute left-20 bg-secondary text-white px-3 py-1.5 rounded-lg text-xs invisible group-hover:visible whitespace-nowrap z-50 shadow-xl font-bold uppercase tracking-widest">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 relative">

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 w-7 h-7 bg-white border border-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-secondary hover:text-white transition-all shadow-lg z-50"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
        </button>
      </div>
    </motion.aside>
  );
}


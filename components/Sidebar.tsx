'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IZIPISLogo } from './Logo';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Estoque', href: '/admin/inventory' },
  { icon: ShoppingCart, label: 'Vendas', href: '/admin/sales' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen bg-[#0D3335] border-r border-white/5 flex flex-col sticky top-0 z-50 shadow-2xl transition-all duration-300"
    >
      {/* Logo Area */}
      <div className={cn(
        "h-24 flex items-center transition-all duration-300",
        isCollapsed ? "justify-center p-0" : "px-8"
      )}>
        <IZIPISLogo 
          variant={isCollapsed ? 'icon' : 'horizontal'} 
          color="monochrome-white" 
          className={cn("transition-all duration-300", isCollapsed ? "scale-90" : "scale-100")} 
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {MENU_ITEMS.map((item) => {
          const isActive = item.href === '/admin' 
            ? pathname === '/admin' 
            : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all cursor-pointer group relative",
                  isActive 
                    ? "bg-secondary text-white shadow-lg shadow-black/20" 
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-300", 
                  isActive ? "text-white" : "text-white/40 group-hover:scale-110",
                  isCollapsed && "mx-auto"
                )} />
                
                {!isCollapsed && (
                  <span className="font-bold text-[13px] uppercase tracking-wider whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
                
                {isCollapsed && (
                  <div className="absolute left-20 bg-primary text-white px-4 py-2 rounded-xl text-xs opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-200 whitespace-nowrap z-[100] shadow-2xl border border-white/10 font-bold uppercase tracking-widest">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-10 w-7 h-7 bg-white border border-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-secondary hover:text-white transition-all shadow-xl z-[60] group"
      >
        <ChevronLeft className={cn(
          "w-4 h-4 transition-transform duration-500", 
          isCollapsed ? "rotate-180" : "rotate-0",
          "group-hover:scale-125"
        )} />
      </button>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </motion.aside>
  );
}

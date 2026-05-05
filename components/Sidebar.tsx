'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Store,
  User as UserIcon,
  BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const handleLogout = () => {
    localStorage.removeItem('izipis_user');
    router.push('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="h-screen bg-secondary/50 border-r border-border flex flex-col relative sticky top-0"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="min-w-[40px] h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Store className="w-6 h-6 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold tracking-tight text-foreground"
          >
            Izipis
          </motion.span>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group relative",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                {!isCollapsed && item.isNew && (
                  <span className="ml-auto text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full font-bold">
                    NEW
                  </span>
                )}
                
                {isCollapsed && (
                  <div className="absolute left-16 bg-foreground text-background px-2 py-1 rounded text-xs invisible group-hover:visible whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-5 h-5 min-w-[20px]" />
          {!isCollapsed && <span className="font-medium">Sair</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-border border border-border rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-lg"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
        </button>
      </div>
    </motion.aside>
  );
}

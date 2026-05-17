'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Calendar,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/auth';

export default function Topbar() {
  const router = useRouter();
  const [currentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-20 bg-white/50 backdrop-blur-md border-b border-primary/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1 max-w-xl pl-16 lg:pl-0">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-secondary transition-colors" />
          <input 
            type="text" 
            placeholder="Pesquisar por produtos, vendas ou clientes..." 
            className="w-full bg-white/50 border border-primary/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none placeholder:text-primary/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-primary/40 uppercase tracking-widest">
          <Calendar className="w-4 h-4" />
          <span>{format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
        </div>

        <div className="h-8 w-[1px] bg-primary/5 mx-2" />

        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-xl bg-white border border-primary/10 text-primary/60 hover:text-secondary transition-colors shadow-sm"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white" />
          </motion.button>

          <div className="relative" ref={menuRef}>
            <motion.div 
              whileHover={{ backgroundColor: 'rgba(var(--secondary-rgb), 0.05)' }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl border border-primary/10 bg-white cursor-pointer transition-all shadow-sm select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-white shadow-lg shadow-secondary/20">
                <User className="w-5 h-5" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-primary leading-tight">Admin User</span>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Administrador</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-primary/40 ml-1 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </motion.div>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-primary/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                >
                  <div className="p-3 mb-2 bg-primary/5 rounded-xl">
                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Sessão atual</p>
                    <p className="text-xs font-bold text-primary truncate">admin@izipis.com</p>
                  </div>

                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-primary/60 hover:bg-primary/5 hover:text-primary transition-all">
                      <Settings className="w-4 h-4" />
                      Configurações
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-primary/60 hover:bg-primary/5 hover:text-primary transition-all">
                      <Shield className="w-4 h-4" />
                      Segurança
                    </button>
                    
                    <div className="h-[1px] bg-primary/5 my-2 mx-2" />
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-danger hover:bg-danger/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair do Sistema
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

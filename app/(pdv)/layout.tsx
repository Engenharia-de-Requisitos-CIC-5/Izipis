'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Store, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PDVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('izipis_user');
    router.push('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="h-16 border-b border-border bg-secondary/50 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight text-lg">Izipis PDV</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <UserIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Vendedor João</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-red-400 hover:bg-red-400/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

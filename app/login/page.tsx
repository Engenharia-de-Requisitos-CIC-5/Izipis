'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LogIn, Mail, Lock, Loader2, Palette } from 'lucide-react';
import { login } from '@/services/auth';
import { cn } from '@/lib/utils';
import { IZIPISLogo } from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await login(email, password);
      if (user) {
        localStorage.setItem('izipis_user', JSON.stringify(user));
        if (user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/pdv');
        }
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao fazer login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans">
      {/* Background blobs for premium look */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-10 relative z-10 bg-white/40 backdrop-blur-xl border border-primary/5 rounded-[2.5rem] shadow-2xl shadow-primary/5"
      >
        <div className="text-center mb-10">
          <IZIPISLogo variant="principal" className="mb-2" />
          <p className="text-foreground/60 font-medium tracking-tight mt-4">Gestão inteligente para o seu mercado</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/70 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/70" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50 border border-primary/10 rounded-2xl py-3.5 pl-12 pr-4 text-foreground focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/70 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/70" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 border border-primary/10 rounded-2xl py-3.5 pl-12 pr-4 text-foreground focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm text-danger font-bold text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4",
              isLoading && "opacity-80 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Entrar no Sistema
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center space-y-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/30 font-bold">
            <p>Dica: use <span className="text-primary">admin@izipis.com</span> para Admin</p>
          </div>
          <Link href="/brand" className="inline-flex items-center gap-2 text-xs font-bold text-accent hover:text-primary transition-colors uppercase tracking-widest">
            <Palette className="w-3 h-3" />
            Visual Identity Case
          </Link>
        </div>
      </motion.div>
    </div>
  );
}


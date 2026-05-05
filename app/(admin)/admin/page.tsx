'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Package, AlertTriangle, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const STATS = [
  { label: 'Vendas Hoje', value: 1250.80, trend: '+12.5%', isPositive: true, icon: TrendingUp, iconColor: 'text-primary' },
  { label: 'Novos Clientes', value: 14, trend: '+4%', isPositive: true, icon: Users, iconColor: 'text-secondary' },
  { label: 'Produtos Ativos', value: 842, trend: '-2%', isPositive: false, icon: Package, iconColor: 'text-primary' },
  { label: 'Estoque Baixo', value: 12, trend: '+2', isPositive: false, icon: AlertTriangle, iconColor: 'text-accent' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Bem-vindo, Admin</h1>
        <p className="text-foreground/60 font-medium">Aqui está o resumo do seu mercadinho hoje.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="cursor-pointer">
            <StatCard label={stat.label} value={typeof stat.value === 'number' && stat.label.includes('Vendas') ? formatCurrency(stat.value) : stat.value} trend={stat.trend} isPositive={stat.isPositive} icon={stat.icon} iconColor={stat.iconColor} />
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><h3 className="font-bold">Desempenho de Vendas</h3></CardHeader>
          <CardContent className="min-h-[300px] flex flex-col justify-center items-center text-muted-foreground bg-white/5 rounded-b-3xl border-t border-primary/5">
            <BarChart3 className="w-16 h-16 text-primary/10 mb-4" />
            <p className="font-medium text-primary/40 uppercase text-[10px] tracking-widest">Sincronizando dados de faturamento em tempo real</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h3 className="font-bold">Gestão Operacional</h3></CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full">Cadastrar Produto</Button>
            <Button variant="secondary" className="w-full">Gerar Relatório Analítico</Button>
            <Button variant="outline" className="w-full">Configurações do Sistema</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

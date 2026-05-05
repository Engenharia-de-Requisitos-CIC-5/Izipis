'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Package, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const STATS = [
  { label: 'Vendas Hoje', value: 1250.80, trend: '+12.5%', isPositive: true, icon: TrendingUp, iconColor: 'text-accent' },
  { label: 'Novos Clientes', value: 14, trend: '+4%', isPositive: true, icon: Users, iconColor: 'text-blue-400' },
  { label: 'Produtos Ativos', value: 842, trend: '-2%', isPositive: false, icon: Package, iconColor: 'text-primary' },
  { label: 'Estoque Baixo', value: 12, trend: '+2', isPositive: false, icon: AlertTriangle, iconColor: 'text-amber-400' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, Admin</h1>
        <p className="text-muted-foreground">Aqui está o resumo do seu mercadinho hoje.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard label={stat.label} value={typeof stat.value === 'number' && stat.label.includes('Vendas') ? formatCurrency(stat.value) : stat.value} trend={stat.trend} isPositive={stat.isPositive} icon={stat.icon} iconColor={stat.iconColor} />
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><h3 className="font-bold">Desempenho de Vendas</h3></CardHeader>
          <CardContent className="min-h-[300px] flex flex-col justify-center items-center text-muted-foreground italic">
            <p>Gráfico de Vendas Semanais (Mock)</p>
            <div className="w-full h-48 mt-4 bg-white/5 rounded-xl border border-dashed border-white/10 flex items-center justify-center">Visualização de Gráfico em breve</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h3 className="font-bold">Ações Rápidas</h3></CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full">Adicionar Produto</Button>
            <Button variant="secondary" className="w-full">Exportar Relatório</Button>
            <Button variant="outline" className="w-full">Configurações</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

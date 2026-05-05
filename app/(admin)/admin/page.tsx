'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Package, AlertTriangle, BarChart3, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getProducts } from '@/services/products';
import { getSalesStats } from '@/services/sales';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    dailyRevenue: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalOrders: 0,
    recentSales: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const products = await getProducts();
      const salesStats = await getSalesStats();
      
      const lowStock = products.filter(p => p.stock < 20).length;
      
      setStats({
        dailyRevenue: salesStats.totalRevenue,
        totalProducts: products.length,
        lowStockCount: lowStock,
        totalOrders: salesStats.totalOrders,
        recentSales: salesStats.recentSales
      });
      setIsLoading(false);
    }
    loadStats();
  }, []);

  const statCards = [
    { label: 'Vendas (Total)', value: stats.dailyRevenue, trend: '+12.5%', isPositive: true, icon: TrendingUp, iconColor: 'text-primary' },
    { label: 'Pedidos Realizados', value: stats.totalOrders, trend: '+4%', isPositive: true, icon: ShoppingBag, iconColor: 'text-secondary' },
    { label: 'Produtos no Catálogo', value: stats.totalProducts, trend: 'Estável', isPositive: true, icon: Package, iconColor: 'text-primary' },
    { label: 'Estoque Crítico', value: stats.lowStockCount, trend: stats.lowStockCount > 5 ? '+2' : 'Sob Controle', isPositive: stats.lowStockCount <= 5, icon: AlertTriangle, iconColor: stats.lowStockCount > 5 ? 'text-danger' : 'text-accent' },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Painel de Controle</h1>
          <p className="text-foreground/60 font-medium">Resumo operacional e financeiro em tempo real.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Última Sincronização</p>
          <p className="text-sm font-bold text-primary/60">{new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard 
              label={stat.label} 
              value={typeof stat.value === 'number' && stat.label.includes('Vendas') ? formatCurrency(stat.value) : stat.value} 
              trend={stat.trend} 
              isPositive={stat.isPositive} 
              icon={stat.icon} 
              iconColor={stat.iconColor} 
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-bold">Análise de Faturamento</h3>
            <Badge className="bg-primary/5 text-primary border-none">LIVE</Badge>
          </CardHeader>
          <CardContent className="min-h-[350px] flex flex-col justify-center items-center text-muted-foreground bg-white/5 rounded-b-3xl border-t border-primary/5">
            {isLoading ? (
              <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <BarChart3 className="w-16 h-16 text-primary/10 mb-4" />
                <p className="font-medium text-primary/40 uppercase text-[10px] tracking-widest text-center max-w-xs">
                  Aguardando volume de dados suficiente para gerar projeções analíticas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <h3 className="font-bold">Vendas Recentes</h3>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {stats.recentSales.length > 0 ? (
              stats.recentSales.map((sale, i) => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-primary uppercase">Pedido #{sale.id.slice(-4)}</p>
                      <p className="text-[10px] text-primary/40 font-bold">{new Date(sale.timestamp).toLocaleTimeString('pt-BR')}</p>
                    </div>
                  </div>
                  <p className="font-black text-primary">{formatCurrency(sale.total)}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-primary/10 py-12">
                <ShoppingBag className="w-12 h-12 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Nenhuma venda hoje</p>
              </div>
            )}
            
            <div className="pt-4 mt-auto">
              <Link href="/admin/inventory">
                <Button className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest">Gerenciar Estoque</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle, 
  BarChart3, 
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getProducts } from '@/services/products';
import { getSalesStats } from '@/services/sales';
import { pollNewOrders, integrateIfoodOrder } from '@/services/ifood';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    dailyRevenue: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalOrders: 0,
    ifoodSales: 0,
    localSales: 0,
    recentSales: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  const loadStats = async () => {
    const products = await getProducts();
    const salesStats = await getSalesStats();
    const lowStock = products.filter(p => p.stock < 20).length;
    
    setStats({
      dailyRevenue: salesStats.totalRevenue,
      totalProducts: products.length,
      lowStockCount: lowStock,
      totalOrders: salesStats.totalOrders,
      ifoodSales: salesStats.ifoodSales,
      localSales: salesStats.localSales,
      recentSales: salesStats.recentSales
    });
    setIsLoading(false);
  };

  useEffect(() => {
    loadStats();
    
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (message: string) => {
    setSyncLogs(prev => [message, ...prev].slice(0, 5));
  };

  const simulateIfoodPolling = async () => {
    setIsPolling(true);
    addLog("Iniciando handshake com iFood API...");
    await new Promise(resolve => setTimeout(resolve, 800));
    
    addLog("Autenticando Merchant ID: IZIPIS-MAIN-01...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addLog("Consumindo fila de eventos...");
    const newOrders = await pollNewOrders();
    
    if (newOrders.length > 0) {
      addLog(`${newOrders.length} novos pedidos detectados!`);
      setPendingOrders(prev => [...newOrders, ...prev]);
      setNotification(`Novo pedido iFood #${newOrders[0].displayId} aguardando revisão.`);
      setTimeout(() => setNotification(null), 5000);
    } else {
      addLog("Nenhum evento pendente na fila.");
      setNotification("Sincronização concluída: tudo em dia.");
      setTimeout(() => setNotification(null), 3000);
    }
    setIsPolling(false);
  };

  const handleIntegrateOrder = async (order: any) => {
    addLog(`Integrando pedido #${order.displayId}...`);
    await integrateIfoodOrder(order);
    setPendingOrders(prev => prev.filter(o => o.id !== order.id));
    addLog(`Pedido #${order.displayId} integrado ao PDV.`);
    await loadStats();
  };

  const statCards = [
    { label: 'Faturamento Total', value: stats.dailyRevenue, trend: '+12.5%', isPositive: true, icon: TrendingUp, iconColor: 'text-primary' },
    { label: 'Pedidos iFood', value: stats.ifoodSales, trend: 'Canal Online', isPositive: true, icon: ShoppingBag, iconColor: 'text-secondary' },
    { label: 'Vendas Balcão', value: stats.localSales, trend: 'Presencial', isPositive: true, icon: Users, iconColor: 'text-primary' },
    { label: 'Estoque Crítico', value: stats.lowStockCount, trend: stats.lowStockCount > 5 ? 'Atenção' : 'Normal', isPositive: stats.lowStockCount <= 5, icon: AlertTriangle, iconColor: stats.lowStockCount > 5 ? 'text-danger' : 'text-accent' },
  ];

  return (
    <div className="space-y-8 font-sans relative">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-[100] bg-success text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-bold text-sm border border-success/20"
          >
            <CheckCircle2 className="w-5 h-5" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-primary uppercase">Console de Comando</h1>
          <p className="text-foreground/60 font-medium text-xs md:text-sm">Gestão integrada: Balcão + iFood + Estoque.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={simulateIfoodPolling} 
            disabled={isPolling}
            className="h-10 px-4 rounded-xl border-primary/10 gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-primary/5"
          >
            <RefreshCw className={cn("w-4 h-4 text-secondary", isPolling && "animate-spin")} />
            {isPolling ? 'Verificando iFood...' : 'Sincronizar iFood'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard 
              label={stat.label} 
              value={typeof stat.value === 'number' && (stat.label.includes('Faturamento') || stat.label.includes('Vendas')) && !stat.label.includes('Balcão') ? formatCurrency(stat.value) : stat.value} 
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
          <CardHeader className="flex flex-row items-center justify-between border-b border-primary/5 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold">Desempenho por Canal</h3>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-secondary/10 text-secondary border-none">iFood: {stats.ifoodSales}</Badge>
              <Badge className="bg-primary/10 text-primary border-none">Local: {stats.localSales}</Badge>
            </div>
          </CardHeader>
          <CardContent className="min-h-[350px] flex flex-col justify-center items-center text-muted-foreground bg-white/5">
            <div className="flex flex-col items-center gap-4 text-center p-12">
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-24 bg-primary/5 rounded-t-lg relative">
                  <div className="absolute bottom-0 w-full bg-primary/20 rounded-t-lg transition-all" style={{ height: `${(stats.localSales / (stats.totalOrders || 1)) * 100}%` }} />
                </div>
                <div className="w-16 h-24 bg-secondary/5 rounded-t-lg relative">
                  <div className="absolute bottom-0 w-full bg-secondary/20 rounded-t-lg transition-all" style={{ height: `${(stats.ifoodSales / (stats.totalOrders || 1)) * 100}%` }} />
                </div>
              </div>
              <p className="font-black text-primary/40 uppercase text-[10px] tracking-widest">Distribuição de Pedidos</p>
              <p className="text-xs text-primary/30 max-w-xs font-medium">As métricas de conversão e ticket médio por canal estão sendo processadas em tempo real.</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/[0.02] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <RefreshCw className={cn("w-4 h-4 text-primary", isPolling && "animate-spin")} />
                <h3 className="font-bold text-sm">Log de Sincronia</h3>
              </div>
              <Badge variant="outline" className="text-[9px] uppercase border-primary/20">iFood Real-time</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {syncLogs.length > 0 ? (
                syncLogs.map((log, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-[10px] font-mono text-primary/60"
                  >
                    <span className="text-primary/30">[{new Date().toLocaleTimeString('pt-BR', { hour12: false })}]</span>
                    <span>{log}</span>
                  </motion.div>
                ))
              ) : (
                <p className="text-[10px] text-primary/30 font-mono italic">Aguardando início do polling...</p>
              )}
            </CardContent>
          </Card>

          {pendingOrders.length > 0 && (
            <Card className="border-secondary/40 bg-secondary/[0.03]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-secondary" />
                    <h3 className="font-bold text-sm text-secondary uppercase">Pedidos Pendentes</h3>
                  </div>
                  <Badge className="bg-secondary text-white">{pendingOrders.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="p-4 rounded-xl bg-white border border-secondary/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[10px] font-black text-primary/40 uppercase">#{order.displayId}</p>
                        <p className="font-bold text-xs">{order.customer.name}</p>
                      </div>
                      <p className="font-black text-sm text-secondary">{formatCurrency(order.total.orderAmount)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleIntegrateOrder(order)}
                        className="flex-1 h-8 text-[10px] bg-primary hover:bg-primary-dark font-black uppercase tracking-widest"
                      >
                        Aceitar
                      </Button>
                      <Button 
                        variant="outline"
                        className="h-8 w-8 p-0 border-primary/10"
                        onClick={() => setPendingOrders(prev => prev.filter(o => o.id !== order.id))}
                      >
                        <X className="w-4 h-4 text-primary/40" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="flex flex-col border-primary/10 bg-primary/[0.01]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-secondary" />
                <h3 className="font-bold text-sm">Status iFood</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-black text-success uppercase">Online</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-2xl bg-white border border-secondary/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-primary/40 uppercase">Merchant ID</span>
                  <span className="text-[10px] font-mono font-bold text-primary">IZIPIS-MAIN-01</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col flex-1">
            <CardHeader>
              <h3 className="font-bold">Histórico Recente</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentSales.length > 0 ? (
                stats.recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-primary/5 group hover:border-secondary/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        sale.source === 'IFOOD' ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                      )}>
                        {sale.source === 'IFOOD' ? <ShoppingBag className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase">{sale.source} #{sale.id.slice(-4)}</p>
                        <p className="text-[9px] text-primary/40 font-bold">{new Date(sale.timestamp).toLocaleTimeString('pt-BR')}</p>
                      </div>
                    </div>
                    <p className="font-black text-xs text-primary">{formatCurrency(sale.total)}</p>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-primary/10 py-12">
                  <ShoppingBag className="w-12 h-12 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">Aguardando Vendas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

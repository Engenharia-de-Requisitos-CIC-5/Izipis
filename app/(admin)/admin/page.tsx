'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Activity, 
  Store, 
  Smartphone,
  Package,
  RefreshCw
} from 'lucide-react';
import { getSales, getSalesStats } from '@/services/sales';
import { getPredictedStockoutRiskCount } from '@/lib/stockout';
import { getProducts } from '@/services/products';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
// A correção está nesta linha abaixo, adicionamos o 'cn' junto com o formatCurrency:
import { formatCurrency, cn } from '@/lib/utils';
import { Product, Sale } from '@/lib/types';

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  avgTicket: number;
  ifoodSales: number;
  localSales: number;
  recentSales: Sale[];
  lowStockCount: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalRevenue: 0,
    totalOrders: 0,
    avgTicket: 0,
    ifoodSales: 0,
    localSales: 0,
    recentSales: [],
    lowStockCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async (): Promise<DashboardData> => {
    const stats = await getSalesStats();
    const products = await getProducts();
    const sales = await getSales();
    const lowStock = getPredictedStockoutRiskCount(products, sales);
    return {
      totalRevenue: stats.totalRevenue,
      totalOrders: stats.totalOrders,
      avgTicket: stats.avgTicket,
      ifoodSales: stats.ifoodSales,
      localSales: stats.localSales,
      recentSales: stats.recentSales,
      lowStockCount: lowStock
    };
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const d = await fetchDashboard();
        if (!mounted) return;
        setData(d);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // Proporção de vendas para os gráficos de barra nativos
  const totalChannels = data.localSales + data.ifoodSales || 1;
  const localPercentage = (data.localSales / totalChannels) * 100;
  const ifoodPercentage = (data.ifoodSales / totalChannels) * 100;

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
      {/* Topo do Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Dashboard Principal</h1>
          <p className="text-foreground/60 font-medium">Dados consolidados do caixa local e integração iFood em tempo real.</p>
        </div>
        <Button 
          onClick={() => { setIsLoading(true); fetchDashboard().then(d => setData(d)).finally(() => setIsLoading(false)); }} 
          disabled={isLoading}
          variant="outline"
          className="border-primary/10 hover:bg-primary/5 font-bold gap-2 rounded-xl"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          Atualizar Dados
        </Button>
      </div>

      {/* Cards de Indicadores (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Faturamento */}
        <Card className="border-primary/5 shadow-sm bg-white overflow-hidden relative group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Faturamento Bruto</p>
                <h3 className="text-3xl font-black font-mono text-primary tracking-tight tabular-nums">
                  {formatCurrency(data.totalRevenue)}
                </h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4%</span>
              <span className="text-primary/30 font-medium ml-1">vendas do balcão e app</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total de Pedidos */}
        <Card className="border-primary/5 shadow-sm bg-white overflow-hidden relative group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Total de Vendas</p>
                <h3 className="text-3xl font-black font-mono text-primary tracking-tight tabular-nums">
                  {data.totalOrders.toString().padStart(2, '0')}
                </h3>
              </div>
              <div className="p-3 bg-primary/5 text-primary rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary/40">
              <Activity className="w-3.5 h-3.5 text-secondary" />
              <span className="font-black text-primary/60">{data.localSales} locais</span>
              <span>•</span>
              <span className="font-black text-rose-500">{data.ifoodSales} iFood</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Ticket Médio */}
        <Card className="border-primary/5 shadow-sm bg-white overflow-hidden relative group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Ticket Médio</p>
                <h3 className="text-3xl font-black font-mono text-primary tracking-tight tabular-nums">
                  {formatCurrency(data.avgTicket)}
                </h3>
              </div>
              <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary/40">
              <span className="font-bold text-primary/60">Média de gasto</span> por cliente no estabelecimento.
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Alertas de Estoque */}
        <Card className={cn(
          "border-primary/5 shadow-sm bg-white overflow-hidden relative group transition-all duration-300",
          data.lowStockCount > 0 && "hover:border-amber-500/30"
        )}>
          {/* Subtle warning accent bar on the left when there is low stock */}
          {data.lowStockCount > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
          )}
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Ruptura Prevista / Estoque Baixo</p>
                <h3 className={cn(
                  "text-3xl font-black font-mono tracking-tight tabular-nums",
                  data.lowStockCount > 0 ? "text-amber-600" : "text-primary"
                )}>
                  {data.lowStockCount.toString().padStart(2, '0')}
                </h3>
              </div>
              <div className={cn(
                "p-3 rounded-xl transition-all duration-300",
                data.lowStockCount > 0 
                  ? "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white" 
                  : "bg-primary/5 text-primary/40 group-hover:bg-primary group-hover:text-white"
              )}>
                {data.lowStockCount > 0 ? (
                  <AlertTriangle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <Package className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary/40">
              {data.lowStockCount > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-bold text-amber-600">Ação recomendada</span>
                  <span>no Izipis Predict.</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  <span className="font-bold text-emerald-600">Tudo abastecido</span>
                  <span>sem alertas.</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gráficos Nativos e Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Painel da Esquerda: Canais de Vendas */}
        <Card className="border-primary/5 shadow-sm bg-white p-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-primary mb-1 flex items-center gap-2">Desempenho por Canal</h2>
          <p className="text-xs text-primary/40 font-medium mb-6">Divisão de faturamento físico vs digital.</p>
          
          <div className="space-y-6">
            {/* Canal Local */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-primary flex items-center gap-1.5"><Store className="w-4 h-4 text-primary/60" /> Vendas Balcão (PDV)</span>
                <span className="text-primary/60 font-mono">{data.localSales} ordens ({localPercentage.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-[#F1F5F9] h-3 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${localPercentage}%` }} 
                  transition={{ duration: 1 }} 
                  className="bg-primary h-full rounded-full" 
                />
              </div>
            </div>

            {/* Canal iFood */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-rose-600 flex items-center gap-1.5"><Smartphone className="w-4 h-4" /> Aplicativo iFood</span>
                <span className="text-rose-600 font-mono">{data.ifoodSales} ordens ({ifoodPercentage.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-[#F1F5F9] h-3 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${ifoodPercentage}%` }} 
                  transition={{ duration: 1 }} 
                  className="bg-rose-500 h-full rounded-full" 
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-primary/5 bg-[#F8FAFC] rounded-2xl p-4 text-center">
            <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Status de Sincronismo</p>
            <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> API iFood Conectada
            </p>
          </div>
        </Card>

        {/* Painel da Direita: Últimas Vendas Geradas */}
        <Card className="border-primary/5 shadow-sm bg-white lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-primary/5 bg-[#F8FAFC] flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-primary">Últimas Vendas do Período</h2>
              <p className="text-xs text-primary/40 font-medium">Transações registradas em tempo real pelo caixa local.</p>
            </div>
            <Badge variant="secondary" className="font-mono">{data.recentSales.length} recentes</Badge>
          </div>

          <div className="flex-1 overflow-x-auto">
            {data.recentSales.length === 0 ? (
              <div className="p-12 text-center text-primary/30 font-medium text-sm flex flex-col items-center justify-center space-y-2">
                <ShoppingBag className="w-10 h-10 stroke-[1]" />
                <p>Nenhuma venda registrada hoje no sistema.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-primary/5 text-[10px] font-black uppercase tracking-widest text-primary/40">
                    <th className="p-4 pl-6">ID / Horário</th>
                    <th className="p-4">Canal</th>
                    <th className="p-4">Pagamento</th>
                    <th className="p-4 text-right pr-6">Total Venda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5 text-sm font-medium">
                  {data.recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-primary/5 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-primary font-mono">{sale.id}</p>
                        <p className="text-[10px] text-primary/40 font-mono mt-0.5">
                          {new Date(sale.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </td>
                      <td className="p-4">
                        {sale.source === 'IFOOD' ? (
                          <Badge className="bg-rose-100 text-rose-700 border-none font-bold text-[10px]">IFOOD</Badge>
                        ) : (
                          <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px]">BALCÃO</Badge>
                        )}
                      </td>
                      <td className="p-4 text-xs font-black uppercase tracking-wider text-primary/60 font-mono">
                        {sale.paymentMethod === 'money' ? 'Dinheiro' : sale.paymentMethod === 'card' ? 'Cartão' : 'PIX'}
                      </td>
                      <td className="p-4 text-right pr-6 font-mono font-black text-primary">
                        {formatCurrency(sale.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Search, Download, ExternalLink, CreditCard, Banknote, QrCode, ArrowUpRight, TrendingUp } from 'lucide-react';
import { getSales } from '@/services/sales';
import { Sale } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getSales();
      setSales(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const getPaymentIcon = (method: Sale['paymentMethod']) => {
    switch (method) {
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'money': return <Banknote className="w-4 h-4" />;
      case 'pix': return <QrCode className="w-4 h-4" />;
      default: return null;
    }
  };

  const totalVolume = sales.reduce((acc, s) => acc + s.total, 0);
  const avgTicket = sales.length > 0 ? totalVolume / sales.length : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Vendas</h1>
          <p className="text-muted-foreground">Monitore todas as transações realizadas no PDV.</p>
        </div>
        <Button variant="secondary"><Download className="w-5 h-5" /> Exportar CSV</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Vendas Totais" value={sales.length} icon={ArrowUpRight} />
        <StatCard label="Volume Total" value={formatCurrency(totalVolume)} icon={TrendingUp} iconColor="text-accent" />
        <StatCard label="Ticket Médio" value={formatCurrency(avgTicket)} icon={CreditCard} iconColor="text-blue-400" />
      </div>

      <Card>
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input type="text" placeholder="Buscar por ID da venda..." className="w-full bg-secondary border border-border rounded-lg py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary transition-all" />
          </div>
          <Button variant="secondary" size="sm"><Calendar className="w-4 h-4" /> Últimos 7 dias</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-border">
                <th className="p-4 font-semibold text-sm">ID da Venda</th>
                <th className="p-4 font-semibold text-sm">Data/Hora</th>
                <th className="p-4 font-semibold text-sm">Itens</th>
                <th className="p-4 font-semibold text-sm">Pagamento</th>
                <th className="p-4 font-semibold text-sm">Total</th>
                <th className="p-4 font-semibold text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-sm font-mono">{sale.id}</td>
                    <td className="p-4 text-sm">{new Date(sale.timestamp).toLocaleString('pt-BR')}</td>
                    <td className="p-4 text-sm">{sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}</td>
                    <td className="p-4"><div className="flex items-center gap-2 text-sm">{getPaymentIcon(sale.paymentMethod)}<span className="capitalize">{sale.paymentMethod.toLowerCase()}</span></div></td>
                    <td className="p-4 font-bold text-accent">{formatCurrency(sale.total)}</td>
                    <td className="p-4 text-right"><Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground"><p>Nenhuma venda registrada ainda.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

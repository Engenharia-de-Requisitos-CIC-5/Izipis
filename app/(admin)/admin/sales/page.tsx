'use client';

import { Badge } from '@/components/ui/Badge';
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
          <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase">Registro de Operações</h1>
          <p className="text-foreground/60 font-medium">Histórico completo de transações e auditoria de caixa.</p>
        </div>
        <Button variant="secondary" className="h-14 px-8 rounded-2xl gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-secondary/10 border-none"><Download className="w-5 h-5" /> Exportar Relatório</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Vendas Totais" value={sales.length} icon={ArrowUpRight} />
        <StatCard label="Volume Total" value={formatCurrency(totalVolume)} icon={TrendingUp} iconColor="text-accent" />
        <StatCard label="Ticket Médio" value={formatCurrency(avgTicket)} icon={CreditCard} iconColor="text-blue-400" />
      </div>

      <Card>
        <div className="p-6 border-b border-primary/5 flex flex-col md:flex-row gap-4 items-center bg-[#F8FAFC]">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 w-5 h-5 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar venda por ID ou cliente..." 
              className="w-full bg-white border border-primary/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" 
            />
          </div>
          <Button variant="secondary" className="h-12 px-6 rounded-xl border-primary/10 gap-2 font-bold"><Calendar className="w-4 h-4" /> Últimos 7 dias</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-primary/5">
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">ID da Venda</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Data/Hora</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Qtd. Itens</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Pagamento</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Total</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-primary/5 transition-all group">
                    <td className="p-5 text-xs font-mono font-bold text-primary/60">{sale.id}</td>
                    <td className="p-5 text-sm font-medium">{new Date(sale.timestamp).toLocaleString('pt-BR')}</td>
                    <td className="p-5">
                      <Badge variant="outline" className="rounded-lg border-primary/10 bg-primary/5 text-[10px] font-black uppercase">{sale.items.length} ITENS</Badge>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                          {getPaymentIcon(sale.paymentMethod)}
                        </div>
                        <span className="capitalize">{sale.paymentMethod.toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="p-5 font-black text-primary">{formatCurrency(sale.total)}</td>
                    <td className="p-5 text-right">
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-primary hover:text-white transition-all"><ExternalLink className="w-4 h-4" /></Button>
                    </td>
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

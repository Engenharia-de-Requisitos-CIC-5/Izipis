'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  Search, 
  Calendar, 
  CreditCard, 
  Banknote, 
  Hash, 
  Store, 
  Smartphone,
  Eye,
  X,
  Printer,
  Download
} from 'lucide-react';
import { getSales } from '@/services/sales';
import { Sale } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const salesRef = useRef<Sale[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const s = await getSales();
        if (!mounted) return;
        const sorted = s.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        salesRef.current = sorted;
        setSales(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // Estado para o Modal de Detalhes do Cupom
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  

  

  const filteredSales = sales.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPaymentIcon = (method: string) => {
    switch(method) {
      case 'money': return <Banknote className="w-4 h-4 text-emerald-600" />;
      case 'card': return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'pix': return <Hash className="w-4 h-4 text-teal-600" />;
      default: return <CreditCard className="w-4 h-4 text-primary/40" />;
    }
  };

  const getPaymentName = (method: string) => {
    switch(method) {
      case 'money': return 'Dinheiro';
      case 'card': return 'Cartão';
      case 'pix': return 'PIX';
      default: return method;
    }
  };

  const handleExportReport = () => {
    const headers = ['ID da Venda', 'Data/Hora', 'Origem/Canal', 'Forma de Pagamento', 'Itens', 'Total (R$)'];
    const rows = filteredSales.map(s => {
      // Garante que a quantidade de itens seja sempre um inteiro
      const totalItems = Math.round(s.items.reduce((acc, item) => acc + item.quantity, 0));
      // Formata o total com sempre 2 casas decimais, sem R$ e sem NBSP, para o Excel reconhecer como número
      const totalFormatted = s.total.toFixed(2).replace('.', ',');
      return [
        `"${s.id}"`,
        `"${new Date(s.timestamp).toLocaleString('pt-BR')}"`,
        `"${s.source === 'IFOOD' ? 'iFood' : 'Balcao'}"`,  // sem acento para evitar encoding
        `"${getPaymentName(s.paymentMethod)}"`,
        totalItems,
        totalFormatted
      ];
    });

    // Configura delimitador ';' e 'sep=;' no topo para o Excel nacional abrir em colunas automaticamente.
    const csvLines = [
      "sep=;",
      headers.map(h => `"${h}"`).join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\r\n'); // \r\n para compatibilidade máxima com Excel no Windows

    // Converte para Windows-1252 (ANSI) — codificação padrão do Excel no Brasil.
    // Isso evita o problema de "BalcÃ£o" que ocorre quando o BOM UTF-8 é ignorado.
    const win1252 = Array.from(csvLines).map(ch => {
      const code = ch.charCodeAt(0);
      // Mapeamento dos caracteres portugueses mais comuns para Windows-1252
      const map: Record<number, number> = {
        0xE3: 0xE3, 0xE0: 0xE0, 0xE1: 0xE1, 0xE2: 0xE2, // ã à á â
        0xC3: 0xC3, 0xC0: 0xC0, 0xC1: 0xC1, 0xC2: 0xC2, // Ã À Á Â
        0xE9: 0xE9, 0xEA: 0xEA, 0xC9: 0xC9, 0xCA: 0xCA, // é ê É Ê
        0xED: 0xED, 0xCD: 0xCD,                           // í Í
        0xF3: 0xF3, 0xF4: 0xF4, 0xF5: 0xF5,              // ó ô õ
        0xD3: 0xD3, 0xD4: 0xD4, 0xD5: 0xD5,              // Ó Ô Õ
        0xFA: 0xFA, 0xDA: 0xDA,                           // ú Ú
        0xE7: 0xE7, 0xC7: 0xC7,                           // ç Ç
      };
      return map[code] !== undefined ? map[code] : (code < 256 ? code : 63); // '?' para outros
    });
    const bytes = new Uint8Array(win1252);
    const blob = new Blob([bytes], { type: 'text/csv;charset=windows-1252;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_vendas_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Auditoria de Vendas</h1>
          <p className="text-foreground/60 font-medium">Histórico completo de transações e cupons fiscais emitidos.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportReport}
            variant="outline" 
            className="h-10 px-4 rounded-xl gap-2 font-bold text-xs uppercase tracking-wider border-primary/10 hover:bg-primary/5 text-primary"
          >
            <Download className="w-4 h-4 text-secondary" />
            Exportar Relatório
          </Button>
          <Badge variant="outline" className="h-10 px-4 rounded-xl border-primary/10 font-bold gap-2 text-primary/60 text-sm">
            <Receipt className="w-4 h-4" /> {sales.length} Transações Registradas
          </Badge>
        </div>
      </div>

      <Card className="border-primary/5 shadow-sm bg-white overflow-hidden">
        <div className="p-4 border-b border-primary/5 flex gap-4 items-center bg-[#F8FAFC]">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por ID do Cupom ou Cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-primary/10 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-primary/5">
                <th className="p-4 pl-6 font-black text-[10px] uppercase tracking-widest text-primary/40">Data / Cupom</th>
                <th className="p-4 font-black text-[10px] uppercase tracking-widest text-primary/40">Canal</th>
                <th className="p-4 font-black text-[10px] uppercase tracking-widest text-primary/40">Pagamento</th>
                <th className="p-4 font-black text-[10px] uppercase tracking-widest text-primary/40">Itens</th>
                <th className="p-4 font-black text-[10px] uppercase tracking-widest text-primary/40 text-right">Valor Total</th>
                <th className="p-4 font-black text-[10px] uppercase tracking-widest text-primary/40 text-center pr-6">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5 text-sm font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-primary/30">Carregando histórico...</td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-primary/40 font-bold">Nenhuma venda encontrada no período.</td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const date = new Date(sale.timestamp);
                  const totalItems = sale.items.reduce((acc, item) => acc + item.quantity, 0);

                  return (
                    <tr key={sale.id} className="hover:bg-primary/5 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-primary flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary/40" /> 
                          {date.toLocaleDateString('pt-BR')} <span className="text-primary/40 mx-1">•</span> {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] font-mono text-primary/40 mt-0.5 font-bold uppercase">ID: {sale.id}</p>
                      </td>
                      <td className="p-4">
                        {sale.source === 'IFOOD' ? (
                          <Badge className="bg-rose-100 text-rose-700 border-none font-bold text-[10px] gap-1 px-2 py-0.5">
                            <Smartphone className="w-3 h-3" /> iFood
                          </Badge>
                        ) : (
                          <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] gap-1 px-2 py-0.5">
                            <Store className="w-3 h-3" /> Balcão
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-white border border-primary/10 rounded-md">
                            {getPaymentIcon(sale.paymentMethod)}
                          </div>
                          <span className="font-bold text-primary/70 text-xs uppercase tracking-wider">{getPaymentName(sale.paymentMethod)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-primary/60">{totalItems} un</span>
                      </td>
                      <td className="p-4 text-right font-mono font-black text-primary text-base">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <button 
                          onClick={() => setSelectedSale(sale)}
                          className="p-2 bg-primary/5 hover:bg-primary/10 rounded-lg text-primary hover:text-primary transition-colors inline-flex items-center justify-center"
                          title="Ver Detalhes do Cupom"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Detalhes da Venda (Visualizador de Cupom) */}
      <AnimatePresence>
        {selectedSale && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Cabeçalho do Cupom */}
              <div className="p-6 border-b border-dashed border-primary/20 bg-[#F8FAFC] text-center relative flex-shrink-0">
                <button 
                  onClick={() => setSelectedSale(null)} 
                  className="absolute top-4 right-4 p-2 hover:bg-primary/5 rounded-full text-primary/40"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Receipt className="w-6 h-6" />
                </div>
                <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-1">MERCADINHO PEDRINHO 2</h2>
                <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Detalhes da Transação</p>
                <p className="text-[9px] font-mono text-primary/40 mt-3 bg-white inline-block px-3 py-1 border border-primary/10 rounded-full">
                  CUPOM: {selectedSale.id}
                </p>
              </div>

              {/* Corpo do Cupom (Itens) */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
                <div className="flex justify-between text-[9px] font-black text-primary/40 uppercase tracking-widest mb-3 border-b border-primary/10 pb-2">
                  <span>Descrição</span>
                  <div className="flex gap-4">
                    <span className="w-8 text-center">Qtd</span>
                    <span className="w-16 text-right">Total</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-medium text-primary border-b border-dashed border-primary/5 pb-2">
                      <span className="flex-1 pr-2 truncate font-bold uppercase text-[10px]">{item.name}</span>
                      <div className="flex gap-4 font-mono">
                        <span className="w-8 text-center text-primary/60">{item.quantity}</span>
                        <span className="w-16 text-right">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rodapé do Cupom (Totais) */}
              <div className="p-6 bg-primary/5 flex flex-col gap-3 flex-shrink-0">
                <div className="flex justify-between items-center text-xs font-bold text-primary/60 uppercase tracking-widest">
                  <span>Data da Compra</span>
                  <span className="font-mono">{new Date(selectedSale.timestamp).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-primary/60 uppercase tracking-widest">
                  <span>Método</span>
                  <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-primary/10">
                    {getPaymentIcon(selectedSale.paymentMethod)} {getPaymentName(selectedSale.paymentMethod)}
                  </span>
                </div>
                <div className="h-px w-full bg-primary/10 my-1" />
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black text-primary uppercase tracking-[0.2em]">Total</span>
                  <span className="text-3xl font-black text-primary font-mono leading-none">{formatCurrency(selectedSale.total)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary-rgb), 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--primary-rgb), 0.2);
        }
      `}</style>
    </div>
  );
}
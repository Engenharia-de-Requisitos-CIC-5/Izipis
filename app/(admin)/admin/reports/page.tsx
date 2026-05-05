'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

const REPORT_TYPES = [
  { title: 'Vendas por Período', description: 'Visão detalhada do faturamento mensal e diário.', icon: BarChart3 },
  { title: 'Produtos Mais Vendidos', description: 'Ranking dos itens com maior saída no estoque.', icon: FileText },
  { title: 'Relatório de Clientes', description: 'Análise de comportamento e fidelidade de compra.', icon: FileText },
  { title: 'Movimentação de Estoque', description: 'Histórico completo de entradas e saídas.', icon: FileText },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Relatórios e Análises</h1>
          <p className="text-foreground/60 font-medium">Extraia inteligência dos dados do seu negócio.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="w-4 h-4" />
            Últimos 30 dias
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Tudo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Receita Total', value: 45280.50, change: '+15%', positive: true },
          { label: 'Ticket Médio', value: 154.20, change: '+5%', positive: true },
          { label: 'Taxa de Retenção', value: '78%', change: '-2%', positive: false },
          { label: 'Novos Leads', value: 342, change: '+22%', positive: true },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-white/50 backdrop-blur-sm border-primary/5 hover:border-secondary/30 transition-all group">
              <CardContent className="p-6">
                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-black text-primary">
                    {typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}
                  </h3>
                  <div className={`flex items-center gap-1 text-xs font-bold ${stat.positive ? 'text-secondary' : 'text-danger'}`}>
                    {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-bold">Crescimento de Receita</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold">Semanal</Button>
              <Button size="sm" className="h-8 text-[10px] uppercase font-bold">Mensal</Button>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] flex flex-col justify-center items-center text-muted-foreground bg-white/30 rounded-b-3xl border-t border-primary/5">
            <BarChart3 className="w-16 h-16 text-primary/10 mb-4" />
            <p className="font-medium">Visualização Analítica Avançada</p>
            <span className="text-xs opacity-60 mt-1">Os dados estão sendo processados pela IA</span>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-bold">Tipos de Relatórios</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {REPORT_TYPES.map((type) => (
                <div key={type.title} className="p-4 rounded-2xl bg-white/50 border border-primary/5 hover:border-secondary/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/5 text-primary group-hover:bg-secondary group-hover:text-white transition-all">
                      <type.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary">{type.title}</h4>
                      <p className="text-[10px] text-foreground/50">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Button className="w-full h-14 rounded-2xl text-lg font-black tracking-tight gap-3 shadow-xl shadow-secondary/20">
            <Filter className="w-5 h-5" />
            Gerar Relatório Customizado
          </Button>
        </div>
      </div>
    </div>
  );
}

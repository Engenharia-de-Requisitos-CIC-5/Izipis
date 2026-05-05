'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, TrendingUp, Target, Users, Sparkles, ArrowRight, Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MLInsightsPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center border border-accent/30"><BrainCircuit className="w-6 h-6 text-accent" /></div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Izipis Intelligence</h1>
          <p className="text-muted-foreground">Insights avançados e previsões baseadas nos seus dados.</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 p-8 rounded-3xl relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 w-12 h-12 text-accent/20" />
        <div className="relative z-10 space-y-6">
          <h2 className="text-2xl font-bold">O futuro do seu mercado</h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">Estamos preparando modelos de Machine Learning que irão analisar seu histórico de vendas para prever demanda, evitar rupturas de estoque e sugerir promoções personalizadas para seus clientes.</p>
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium flex items-center gap-2"><Database className="w-4 h-4 text-primary" /> Coleta de dados ativa</div>
            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium flex items-center gap-2 text-accent"><Sparkles className="w-4 h-4" /> IA em treinamento</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ y: -5 }}>
          <Card className="h-full">
            <CardContent className="p-8 space-y-4">
              <div className="p-3 w-fit rounded-2xl bg-blue-500/10 text-blue-400"><TrendingUp className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold">Previsão de Demanda</h3>
              <p className="text-muted-foreground">Saiba exatamente quanto de cada produto você venderá na próxima semana. Reduza o desperdício e nunca fique sem os itens mais procurados.</p>
              <Button variant="ghost" className="p-0 text-primary group hover:bg-transparent">SAIBA MAIS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Button>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div whileHover={{ y: -5 }}>
          <Card className="h-full">
            <CardContent className="p-8 space-y-4">
              <div className="p-3 w-fit rounded-2xl bg-purple-500/10 text-purple-400"><Target className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold">Recomendações Inteligentes</h3>
              <p className="text-muted-foreground">O sistema sugerirá produtos complementares no PDV baseando-se no perfil de compra, aumentando o seu ticket médio automaticamente.</p>
              <Button variant="ghost" className="p-0 text-primary group hover:bg-transparent">SAIBA MAIS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="border-dashed border-white/20 opacity-70">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center"><Users className="w-8 h-8 text-muted-foreground" /></div>
          <div className="space-y-1"><h4 className="font-bold">Segmentação de Clientes</h4><p className="text-sm text-muted-foreground">Identifique seus clientes mais fiéis e crie campanhas de fidelidade automáticas.</p></div>
          <span className="text-[10px] font-black tracking-widest uppercase bg-white/10 px-2 py-1 rounded">EM DESENVOLVIMENTO</span>
        </CardContent>
      </Card>
    </div>
  );
}

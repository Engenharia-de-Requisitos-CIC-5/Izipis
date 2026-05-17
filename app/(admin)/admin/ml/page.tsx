'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  AlertTriangle, 
  TrendingDown, 
  Database, 
  Sparkles, 
  ShieldCheck,
  Calculator,
  ArrowRight,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getProducts } from '@/services/products';
import { formatCurrency, cn } from '@/lib/utils';
import { Product } from '@/lib/types';

// Interface para o resultado da previsão da IA
interface PredictionResult {
  product: Product;
  daysToExpiry: number;
  salesVelocity: number; // vendas por dia estimadas
  riskScore: number; // 0 a 100
  suggestedAction: string;
  suggestedDiscount: number; // porcentagem
}

export default function MLInsightsPage() {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState({
    analyzedItems: 0,
    highRiskItems: 0,
    potentialLoss: 0,
    savedValue: 0
  });

  // =========================================================================
  // MOTOR DE MACHINE LEARNING (SIMULADO / HEURÍSTICO)
  // Este algoritmo simula uma Regressão Linear/Árvore de Decisão simples
  // para calcular o risco do produto vencer antes de ser vendido.
  // =========================================================================
  const runPredictionModel = async () => {
    setIsAnalyzing(true);
    
    // Busca os produtos do banco local
    const products = await getProducts();
    
    // Simula um delay de processamento para efeito visual
    await new Promise(resolve => setTimeout(resolve, 1500));

    const results: PredictionResult[] = [];
    let highRiskCount = 0;
    let lossRisk = 0;

    const today = new Date();

    products.forEach(product => {
      // Só analisa produtos com validade cadastrada e que tenham estoque
      if (product.validade && product.stock > 0) {
        const expiryDate = new Date(product.validade);
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysToExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Simula a "Velocidade de Venda" (Velocity) baseada na categoria
        // Em um ML real, isso viria do histórico de vendas do banco de dados
        let baseVelocity = 1.5; 
        if (product.category === 'Laticínios') baseVelocity = 3.0;
        if (product.category === 'Hortifruti') baseVelocity = 5.0;
        
        // Adiciona um fator aleatório para simular dados do mundo real (ruído)
        const salesVelocity = Math.max(0.2, baseVelocity + (Math.random() * 2 - 1));

        // Dias necessários para zerar o estoque atual
        const daysToSellOut = product.stock / salesVelocity;

        // CÁLCULO DE RISCO (Risk Score):
        // Se os dias para vender forem maiores que os dias para vencer, o risco é alto.
        let riskScore = 0;
        if (daysToExpiry <= 0) {
          riskScore = 100; // Já venceu
        } else {
          // Fórmula: (Dias necessários / Dias disponíveis) * 100
          riskScore = (daysToSellOut / daysToExpiry) * 100;
        }

        // Limita o score entre 0 e 100
        riskScore = Math.min(100, Math.max(0, riskScore));

        // Define a ação sugerida com base no score de risco
        let suggestedAction = "Estoque Saudável - Manter Preço";
        let suggestedDiscount = 0;

        if (riskScore > 85) {
          suggestedAction = "Liquidação Imediata (Risco Crítico)";
          suggestedDiscount = 40; // 40% de desconto
          highRiskCount++;
          lossRisk += (product.price * product.stock);
        } else if (riskScore > 60) {
          suggestedAction = "Promoção Preventiva (Alerta Laranja)";
          suggestedDiscount = 15; // 15% de desconto
          highRiskCount++;
          lossRisk += (product.price * product.stock);
        } else if (riskScore > 40) {
          suggestedAction = "Monitorar Saída";
          suggestedDiscount = 5;
        }

        results.push({
          product,
          daysToExpiry,
          salesVelocity,
          riskScore,
          suggestedAction,
          suggestedDiscount
        });
      }
    });

    // Ordena do maior risco para o menor
    results.sort((a, b) => b.riskScore - a.riskScore);

    setPredictions(results);
    setMetrics({
      analyzedItems: results.length,
      highRiskItems: highRiskCount,
      potentialLoss: lossRisk,
      savedValue: lossRisk * 0.85 // Simula que as promoções salvam 85% do valor
    });
    
    setIsAnalyzing(false);
  };

  useEffect(() => {
    // Roda o modelo automaticamente ao carregar a página
    runPredictionModel();
  }, []);

  const getRiskColor = (score: number) => {
    if (score > 85) return "text-danger bg-danger/10 border-danger/20";
    if (score > 60) return "text-amber-600 bg-amber-500/10 border-amber-500/20";
    return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary">Izipis Predict (IA)</h1>
            <p className="text-foreground/60 font-medium">Algoritmo de previsão de perda e sugestão de precificação dinâmica.</p>
          </div>
        </div>
        <Button 
          onClick={runPredictionModel} 
          disabled={isAnalyzing}
          className="px-6 h-12 rounded-xl gap-2 font-black uppercase tracking-widest bg-secondary hover:bg-secondary-dark text-white border-none"
        >
          {isAnalyzing ? (
            <><Sparkles className="w-5 h-5 animate-spin" /> PROCESSANDO DADOS...</>
          ) : (
            <><Calculator className="w-5 h-5" /> RECALCULAR MODELO</>
          )}
        </Button>
      </div>

      {/* Métricas do Modelo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-primary/10 bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Lotes Analisados</p>
            <p className="text-3xl font-black text-primary">{metrics.analyzedItems}</p>
          </CardContent>
        </Card>
        <Card className="border-danger/20 bg-danger/5">
          <CardContent className="p-6">
            <p className="text-[10px] font-black text-danger/60 uppercase tracking-widest mb-1">Itens em Risco (Hoje)</p>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-danger" />
              <p className="text-3xl font-black text-danger">{metrics.highRiskItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/10 bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Perda Financeira Prevista</p>
            <p className="text-3xl font-mono font-black text-primary">{formatCurrency(metrics.potentialLoss)}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-6">
            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Recuperação Estimada (IA)</p>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-emerald-600" />
              <p className="text-3xl font-mono font-black text-emerald-600">{formatCurrency(metrics.savedValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Resultados Preditivos */}
      <Card className="border-primary/10 overflow-hidden bg-white">
        <div className="p-6 border-b border-primary/5 bg-[#F8FAFC] flex justify-between items-center">
          <h2 className="font-bold text-primary flex items-center gap-2">
            <Database className="w-5 h-5 text-secondary" />
            Diagnóstico de Validade & Precificação
          </h2>
          <Badge className="bg-primary text-white font-bold tracking-widest">MODELO: REGRESSÃO TEMPORAL V1.0</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-primary/5">
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Produto Analisado</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Dias p/ Vencer</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Giro (Und/Dia)</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Score de Risco</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Ação Prescritiva (IA)</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40 text-right">Aplicar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {isAnalyzing ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <BrainCircuit className="w-12 h-12 text-primary/20 animate-pulse" />
                      <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">Calculando matriz de risco...</p>
                    </div>
                  </td>
                </tr>
              ) : predictions.length > 0 ? (
                predictions.map((item, idx) => (
                  <tr key={idx} className="hover:bg-primary/5 transition-all">
                    <td className="p-5">
                      <div>
                        <p className="font-bold text-primary">{item.product.name}</p>
                        <p className="text-[10px] text-primary/40 font-mono mt-0.5">Lote: {item.product.lote} | Estq: {item.product.stock}</p>
                      </div>
                    </td>
                    <td className="p-5 font-mono font-bold text-primary/60">{item.daysToExpiry} dias</td>
                    <td className="p-5 font-mono font-bold text-primary/60">~{item.salesVelocity.toFixed(1)} ud/dia</td>
                    <td className="p-5">
                      <Badge className={cn("px-3 py-1 font-black", getRiskColor(item.riskScore))}>
                        {item.riskScore.toFixed(0)}% DE RISCO
                      </Badge>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-primary">{item.suggestedAction}</span>
                        {item.suggestedDiscount > 0 && (
                          <span className="text-[10px] font-black text-secondary flex items-center gap-1">
                            <Tag className="w-3 h-3" /> SUGERIDO: -{item.suggestedDiscount}% OFF
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      {item.suggestedDiscount > 0 ? (
                        <Button size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary-dark">
                          Aplicar Preço
                        </Button>
                      ) : (
                        <span className="text-[10px] font-bold text-primary/30 uppercase">Sem Ação</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <ShieldCheck className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
                    <p className="text-sm font-bold text-primary/60">Nenhum produto perecível cadastrado ou em risco no momento.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
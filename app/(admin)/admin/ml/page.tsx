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
  Tag,
  PackageMinus,
  ShoppingCart,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getProducts } from '@/services/products';
import { formatCurrency, cn } from '@/lib/utils';
import { Product } from '@/lib/types';

// Interfaces para os resultados da IA
interface ExpiryPrediction {
  product: Product;
  daysToExpiry: number;
  salesVelocity: number;
  riskScore: number;
  suggestedAction: string;
  suggestedDiscount: number;
}

interface DemandPrediction {
  product: Product;
  salesVelocity: number;      // Vendas por dia
  daysToStockout: number;     // Dias até o estoque zerar
  stockoutRisk: number;       // Score de risco de ficar sem o produto
  suggestedPurchase: number;  // Quantidade sugerida para repor
  status: 'CRITICO' | 'ALERTA' | 'SAUDAVEL';
}

export default function MLInsightsPage() {
  const [expiryPredictions, setExpiryPredictions] = useState<ExpiryPrediction[]>([]);
  const [demandPredictions, setDemandPredictions] = useState<DemandPrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState({
    analyzedItems: 0,
    highRiskExpiry: 0,
    highRiskStockout: 0, // Produtos prestes a faltar
    savedValue: 0
  });

  // =========================================================================
  // MOTOR MULTI-CAMADA DE MACHINE LEARNING (SIMULADO)
  // =========================================================================
  const runPredictionModel = async () => {
    setIsAnalyzing(true);
    const products = await getProducts();
    await new Promise(resolve => setTimeout(resolve, 1800)); // Simula processamento pesado

    const expiryResults: ExpiryPrediction[] = [];
    const demandResults: DemandPrediction[] = [];
    
    let expiryRiskCount = 0;
    let stockoutRiskCount = 0;
    let lossRisk = 0;

    const today = new Date();

    products.forEach(product => {
      // --- 1. SIMULAÇÃO DE GIRO (VELOCIDADE DE VENDA) ---
      // Na vida real, a IA leria a tabela de Vendas. Aqui usamos uma heurística baseada na categoria.
      let baseVelocity = 1.5; 
      if (product.category === 'Laticínios') baseVelocity = 3.5;
      if (product.category === 'Hortifruti') baseVelocity = 5.0;
      if (product.category === 'Padaria') baseVelocity = 8.0;
      
      const salesVelocity = Math.max(0.5, baseVelocity + (Math.random() * 2 - 1));
      const daysToSellOut = product.stock / salesVelocity;

      // =================================================================
      // MODELO 1: RISCO DE VENCIMENTO (PERDA)
      // =================================================================
      if (product.validade && product.stock > 0) {
        const expiryDate = new Date(product.validade);
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysToExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

        let riskScore = 0;
        if (daysToExpiry <= 0) {
          riskScore = 100;
        } else {
          riskScore = (daysToSellOut / daysToExpiry) * 100;
        }
        riskScore = Math.min(100, Math.max(0, riskScore));

        let suggestedAction = "Estoque Saudável - Manter Preço";
        let suggestedDiscount = 0;

        if (riskScore > 85) {
          suggestedAction = "Liquidação Imediata";
          suggestedDiscount = 40;
          expiryRiskCount++;
          lossRisk += (product.price * product.stock);
        } else if (riskScore > 60) {
          suggestedAction = "Promoção Preventiva";
          suggestedDiscount = 15;
          expiryRiskCount++;
          lossRisk += (product.price * product.stock);
        } else if (riskScore > 40) {
          suggestedAction = "Monitorar Saída";
          suggestedDiscount = 5;
        }

        expiryResults.push({
          product, daysToExpiry, salesVelocity, riskScore, suggestedAction, suggestedDiscount
        });
      }

      // =================================================================
      // MODELO 2: PREVISÃO DE DEMANDA E RUPTURA (FALTA DE ESTOQUE)
      // =================================================================
      // Assumindo que o Lead Time (tempo pro fornecedor entregar) seja de 7 dias
      const leadTime = 7; 
      let stockoutRisk = 0;
      let status: DemandPrediction['status'] = 'SAUDAVEL';
      
      // Quantas unidades a IA sugere comprar para cobrir 15 dias de vendas?
      const targetStockFor15Days = Math.ceil(salesVelocity * 15);
      let suggestedPurchase = 0;

      if (daysToSellOut <= leadTime) {
        // Se acaba antes do fornecedor chegar, é CRÍTICO!
        stockoutRisk = 90 + Math.random() * 10;
        status = 'CRITICO';
        stockoutRiskCount++;
        suggestedPurchase = targetStockFor15Days - product.stock;
      } else if (daysToSellOut <= leadTime + 5) {
        // Se acaba logo depois, é ALERTA.
        stockoutRisk = 60 + Math.random() * 20;
        status = 'ALERTA';
        suggestedPurchase = targetStockFor15Days - product.stock;
      } else {
        stockoutRisk = (leadTime / daysToSellOut) * 100;
      }

      demandResults.push({
        product,
        salesVelocity,
        daysToStockout: isFinite(daysToSellOut) ? Math.max(0, daysToSellOut) : 999,
        stockoutRisk: Math.min(100, stockoutRisk),
        suggestedPurchase: Math.max(0, suggestedPurchase),
        status
      });
    });

    // Ordenação dos resultados (Maiores riscos primeiro)
    expiryResults.sort((a, b) => b.riskScore - a.riskScore);
    demandResults.sort((a, b) => b.stockoutRisk - a.stockoutRisk);

    setExpiryPredictions(expiryResults);
    setDemandPredictions(demandResults);
    
    setMetrics({
      analyzedItems: products.length,
      highRiskExpiry: expiryRiskCount,
      highRiskStockout: stockoutRiskCount,
      savedValue: lossRisk * 0.85 
    });
    
    setIsAnalyzing(false);
  };

  useEffect(() => {
    runPredictionModel();
  }, []);

  const getRiskColor = (score: number) => {
    if (score > 85) return "text-danger bg-danger/10 border-danger/20";
    if (score > 60) return "text-amber-600 bg-amber-500/10 border-amber-500/20";
    return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary">Izipis Predict</h1>
            <p className="text-foreground/60 font-medium">Algoritmos de Prevenção de Perdas e Previsão de Demanda Temporal.</p>
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

      {/* DASHBOARD DE MÉTRICAS DA IA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-primary/10 bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Catálogo Analisado</p>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary/40" />
              <p className="text-3xl font-black text-primary">{metrics.analyzedItems} <span className="text-sm text-primary/40">SKUs</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Métrica: Risco de Vencer */}
        <Card className="border-danger/20 bg-danger/5">
          <CardContent className="p-6">
            <p className="text-[10px] font-black text-danger/60 uppercase tracking-widest mb-1">Risco de Vencimento</p>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-danger" />
              <p className="text-3xl font-black text-danger">{metrics.highRiskExpiry}</p>
            </div>
          </CardContent>
        </Card>

        {/* Nova Métrica: Risco de Ruptura (Faltar Estoque) */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-6">
            <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-1">Risco de Ruptura (Faltar)</p>
            <div className="flex items-center gap-2">
              <PackageMinus className="w-6 h-6 text-amber-600" />
              <p className="text-3xl font-black text-amber-600">{metrics.highRiskStockout}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-6">
            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Recuperação Estimada</p>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-emerald-600" />
              <p className="text-3xl font-mono font-black text-emerald-600">{formatCurrency(metrics.savedValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* TABELA 1: PREVISÃO DE DEMANDA (RUPTURA DE ESTOQUE) - NOVA FEATURE!        */}
      {/* ========================================================================= */}
      <Card className="border-primary/10 overflow-hidden bg-white mt-8">
        <div className="p-6 border-b border-primary/5 bg-amber-50/50 flex justify-between items-center">
          <h2 className="font-bold text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Previsão de Demanda & Reposição Inteligente
          </h2>
          <Badge className="bg-amber-100 text-amber-700 border-none font-bold tracking-widest">SÉRIES TEMPORAIS V2.0</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-primary/5">
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Produto Analisado</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Giro Diário</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Dias p/ Zerar</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Status do Estoque</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40 text-right">Ação Sugerida (IA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {isAnalyzing ? (
                <tr><td colSpan={5} className="p-12 text-center"><Activity className="w-8 h-8 text-primary/20 animate-pulse mx-auto" /></td></tr>
              ) : demandPredictions.slice(0, 5).map((item, idx) => ( // Mostra o top 5
                <tr key={`demand-${idx}`} className="hover:bg-primary/5 transition-all">
                  <td className="p-5">
                    <p className="font-bold text-primary">{item.product.name}</p>
                    <p className="text-[10px] text-primary/40 font-mono mt-0.5">Estoque Atual: {item.product.stock} un</p>
                  </td>
                  <td className="p-5 font-mono font-bold text-primary/60">~{item.salesVelocity.toFixed(1)} ud/dia</td>
                  <td className="p-5 font-mono font-black text-primary">
                    {item.daysToStockout > 365 ? '+1 ano' : `${item.daysToStockout.toFixed(0)} dias`}
                  </td>
                  <td className="p-5">
                    {item.status === 'CRITICO' && <Badge className="bg-danger/10 text-danger border-none font-black">RUPTURA IMINENTE</Badge>}
                    {item.status === 'ALERTA' && <Badge className="bg-amber-100 text-amber-700 border-none font-black">REPOR EM BREVE</Badge>}
                    {item.status === 'SAUDAVEL' && <Badge className="bg-emerald-100 text-emerald-700 border-none font-black">ABASTECIDO</Badge>}
                  </td>
                  <td className="p-5 text-right">
                    {item.suggestedPurchase > 0 ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold text-primary/40 uppercase">Comprar Fornecedor</span>
                        <Button size="sm" className="h-8 text-[11px] font-black uppercase tracking-widest bg-primary hover:bg-primary-dark gap-2">
                          <ShoppingCart className="w-3 h-3" /> + {item.suggestedPurchase} un
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-primary/30 uppercase">Não Comprar</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* TABELA 2: RISCO DE VENCIMENTO E PRECIFICAÇÃO DINÂMICA                       */}
      {/* ========================================================================= */}
      <Card className="border-primary/10 overflow-hidden bg-white">
        <div className="p-6 border-b border-primary/5 bg-[#F8FAFC] flex justify-between items-center">
          <h2 className="font-bold text-primary flex items-center gap-2">
            <Database className="w-5 h-5 text-secondary" />
            Diagnóstico de Validade & Precificação
          </h2>
          <Badge className="bg-primary text-white font-bold tracking-widest">MODELO: REGRESSÃO TEMPORAL</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-primary/5">
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Produto (Perecível)</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Dias p/ Vencer</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Score de Risco</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Ação Prescritiva (IA)</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40 text-right">Aplicar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {isAnalyzing ? (
                <tr><td colSpan={5} className="p-12 text-center"><Activity className="w-8 h-8 text-primary/20 animate-pulse mx-auto" /></td></tr>
              ) : expiryPredictions.length > 0 ? (
                expiryPredictions.slice(0, 5).map((item, idx) => (
                  <tr key={`expiry-${idx}`} className="hover:bg-primary/5 transition-all">
                    <td className="p-5">
                      <p className="font-bold text-primary">{item.product.name}</p>
                      <p className="text-[10px] text-primary/40 font-mono mt-0.5">Lote: {item.product.lote} | Estq: {item.product.stock}</p>
                    </td>
                    <td className="p-5 font-mono font-bold text-primary/60">{item.daysToExpiry} dias</td>
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
                  <td colSpan={5} className="p-12 text-center">
                    <ShieldCheck className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
                    <p className="text-sm font-bold text-primary/60">Nenhum produto perecível em risco no momento.</p>
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
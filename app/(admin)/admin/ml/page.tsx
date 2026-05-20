'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { activePredictProducts } from '@/services/mockPredictData';
import { formatCurrency, cn } from '@/lib/utils';
import { Product } from '@/lib/types';
import { updateProduct, getProducts } from '@/services/products';
import { getSales } from '@/services/sales';

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
  const router = useRouter();
  const [expiryPredictions, setExpiryPredictions] = useState<ExpiryPrediction[]>([]);
  const [demandPredictions, setDemandPredictions] = useState<DemandPrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState({
    analyzedItems: 0,
    highRiskExpiry: 0,
    highRiskStockout: 0, // Produtos prestes a faltar
    savedValue: 0
  });

  const handleApplyDiscount = async (productId: string, productName: string, originalPrice: number, discount: number) => {
    const newPrice = Number((originalPrice * (1 - discount / 100)).toFixed(2));
    const success = await updateProduct(productId, { price: newPrice });
    if (success) {
      alert(`Desconto de ${discount}% aplicado no ${productName}! Novo preço de venda: R$ ${newPrice.toFixed(2).replace('.', ',')}`);
      runPredictionModel();
    } else {
      alert('Erro ao aplicar desconto.');
    }
  };

  const handlePurchaseRedirect = (sku: string, quantity: number) => {
    router.push(`/admin/recebimento?sku=${sku}&qty=${quantity}`);
  };

  // =========================================================================
  // MOTOR MULTI-CAMADA DE MACHINE LEARNING (SIMULADO)
  // =========================================================================
  const runPredictionModel = async () => {
    setIsAnalyzing(true);
    
    // Carrega produtos reais do banco de dados (localStorage)
    const dbProducts = await getProducts();
    const dbSales = await getSales();
    
    // Mapeia os produtos acoplando a velocidade de venda calculada em tempo real com base no histórico de cupons
    const products = dbProducts.map(dbProd => {
      const mockProd = activePredictProducts.find(m => m.sku === dbProd.sku);
      const mockVelocity = mockProd ? mockProd.salesVelocity : 1.2;

      // Filtra vendas deste produto na base
      const itemSales = dbSales.flatMap(s => 
        s.items.filter(item => item.productId === dbProd.id).map(item => ({
          qty: item.quantity,
          timestamp: s.timestamp
        }))
      );

      let calculatedVelocity = mockVelocity;
      if (itemSales.length > 0) {
        const totalSold = itemSales.reduce((acc, sale) => acc + sale.qty, 0);
        const timestamps = itemSales.map(s => new Date(s.timestamp).getTime());
        const minTime = Math.min(...timestamps);
        const maxTime = Date.now();
        const diffDays = Math.max(1, Math.ceil((maxTime - minTime) / (1000 * 3600 * 24)));
        const realAvg = totalSold / diffDays;
        
        // Suavização Exponencial (Peso 70% para vendas reais do PDV, 30% para a estimativa base do cenário)
        calculatedVelocity = Number((0.7 * realAvg + 0.3 * mockVelocity).toFixed(1));
        if (calculatedVelocity < 0.1) calculatedVelocity = 0.1; // evita divisão por zero
      }

      return {
        ...dbProd,
        salesVelocity: calculatedVelocity
      };
    }).filter(p => p.category === 'Laticínios' || p.category === 'Congelados' || p.category === 'Açougue' || p.category === 'Padaria' || p.validade);

    await new Promise(resolve => setTimeout(resolve, 1800)); // Simula processamento pesado

    const expiryResults: ExpiryPrediction[] = [];
    const demandResults: DemandPrediction[] = [];
    
    let expiryRiskCount = 0;
    let stockoutRiskCount = 0;
    let lossRisk = 0;

    const today = new Date();

    products.forEach(product => {
      // --- 1. GIRO (VELOCIDADE DE VENDA) ---
      const salesVelocity = product.salesVelocity;
      const daysToSellOut = product.stock / salesVelocity;

      // =================================================================
      // MODELO 1: RISCO DE VENCIMENTO (PERDA)
      // =================================================================
      if (product.validade && product.stock > 0) {
        const expiryDate = new Date(product.validade);
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysToExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

        let riskScore = 0;
        let suggestedAction = "Estoque Saudável - Manter Preço";
        let suggestedDiscount = 0;

        if (daysToExpiry < 0) {
          riskScore = 100;
          suggestedAction = "Retirar de Exposição (Vencido)";
          suggestedDiscount = 0;
          expiryRiskCount++;
          lossRisk += (product.price * product.stock);
        } else if (daysToExpiry === 0) {
          riskScore = 100;
          suggestedAction = "Vence Hoje - Retirar";
          suggestedDiscount = 0;
          expiryRiskCount++;
          lossRisk += (product.price * product.stock);
        } else {
          riskScore = (daysToSellOut / daysToExpiry) * 100;
          riskScore = Math.min(100, Math.max(0, riskScore));

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
        }

        expiryResults.push({
          product, daysToExpiry, salesVelocity, riskScore, suggestedAction, suggestedDiscount
        });
      }

      // =================================================================
      // MODELO 2: PREVISÃO DE DEMANDA E RUPTURA (FALTA DE ESTOQUE)
      // =================================================================
      const leadTime = 7; 
      let stockoutRisk = 0;
      let status: DemandPrediction['status'] = 'SAUDAVEL';
      
      const targetStockFor15Days = Math.ceil(salesVelocity * 15);
      let suggestedPurchase = 0;

      if (daysToSellOut <= leadTime) {
        // Se acaba antes do lead time, é CRÍTICO (cálculo determinístico)
        stockoutRisk = 90 + Math.max(0, (leadTime - daysToSellOut) / leadTime) * 10;
        status = 'CRITICO';
        stockoutRiskCount++;
        suggestedPurchase = targetStockFor15Days - product.stock;
      } else if (daysToSellOut <= leadTime + 5) {
        // Se acaba na margem de segurança de 5 dias adicionais, é ALERTA
        stockoutRisk = 60 + Math.max(0, ((leadTime + 5) - daysToSellOut) / 5) * 20;
        status = 'ALERTA';
        suggestedPurchase = targetStockFor15Days - product.stock;
      } else {
        stockoutRisk = Math.min(59, (leadTime / daysToSellOut) * 100);
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
    // Polling: recalcula o modelo a cada 30 segundos para refletir mudanças de estoque/vendas
    const interval = setInterval(() => {
      runPredictionModel();
    }, 30000);
    return () => clearInterval(interval);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Catálogo Analisado */}
        <Card className="border-primary/5 shadow-sm bg-white overflow-hidden relative group transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Catálogo Analisado</p>
                <h3 className="text-3xl font-black font-mono text-primary tracking-tight tabular-nums">
                  {metrics.analyzedItems.toString().padStart(2, '0')} <span className="text-sm font-sans font-medium text-primary/40">SKUs</span>
                </h3>
              </div>
              <div className="p-3 bg-primary/5 text-primary/40 rounded-xl transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                <Database className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Risco de Vencimento */}
        <Card className={cn(
          "border-primary/5 shadow-sm bg-white overflow-hidden relative group transition-all duration-300 hover:shadow-md",
          metrics.highRiskExpiry > 0 && "hover:border-danger/30"
        )}>
          {metrics.highRiskExpiry > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-danger" />
          )}
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Risco de Vencimento</p>
                <h3 className={cn(
                  "text-3xl font-black font-mono tracking-tight tabular-nums",
                  metrics.highRiskExpiry > 0 ? "text-danger" : "text-primary"
                )}>
                  {metrics.highRiskExpiry.toString().padStart(2, '0')}
                </h3>
              </div>
              <div className={cn(
                "p-3 rounded-xl transition-all duration-300",
                metrics.highRiskExpiry > 0 
                  ? "bg-danger/10 text-danger group-hover:bg-danger group-hover:text-white" 
                  : "bg-primary/5 text-primary/40 group-hover:bg-primary group-hover:text-white"
              )}>
                <AlertTriangle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Risco de Ruptura (Faltar) */}
        <Card className={cn(
          "border-primary/5 shadow-sm bg-white overflow-hidden relative group transition-all duration-300 hover:shadow-md",
          metrics.highRiskStockout > 0 && "hover:border-amber-500/30"
        )}>
          {metrics.highRiskStockout > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
          )}
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Risco de Ruptura (Faltar)</p>
                <h3 className={cn(
                  "text-3xl font-black font-mono tracking-tight tabular-nums",
                  metrics.highRiskStockout > 0 ? "text-amber-600" : "text-primary"
                )}>
                  {metrics.highRiskStockout.toString().padStart(2, '0')}
                </h3>
              </div>
              <div className={cn(
                "p-3 rounded-xl transition-all duration-300",
                metrics.highRiskStockout > 0 
                  ? "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white" 
                  : "bg-primary/5 text-primary/40 group-hover:bg-primary group-hover:text-white"
              )}>
                <PackageMinus className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Recuperação Estimada */}
        <Card className={cn(
          "border-primary/5 shadow-sm bg-white overflow-hidden relative group transition-all duration-300 hover:shadow-md",
          metrics.savedValue > 0 && "hover:border-emerald-500/30"
        )}>
          {metrics.savedValue > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
          )}
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Recuperação Estimada</p>
                <h3 className={cn(
                  "text-3xl font-black font-mono tracking-tight tabular-nums",
                  metrics.savedValue > 0 ? "text-emerald-600" : "text-primary"
                )}>
                  {formatCurrency(metrics.savedValue)}
                </h3>
              </div>
              <div className={cn(
                "p-3 rounded-xl transition-all duration-300",
                metrics.savedValue > 0 
                  ? "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white" 
                  : "bg-primary/5 text-primary/40 group-hover:bg-primary group-hover:text-white"
              )}>
                <TrendingDown className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
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
                        <Button 
                          onClick={() => handlePurchaseRedirect(item.product.sku, item.suggestedPurchase)}
                          size="sm" 
                          className="h-8 text-[11px] font-black uppercase tracking-widest bg-primary hover:bg-primary-dark gap-2"
                        >
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
                    <td className="p-5 font-mono font-bold text-primary/60">
                      {item.daysToExpiry < 0 ? (
                        <span className="text-danger font-black">Vencido há {Math.abs(item.daysToExpiry)} {Math.abs(item.daysToExpiry) === 1 ? 'dia' : 'dias'}</span>
                      ) : item.daysToExpiry === 0 ? (
                        <span className="text-danger font-black">Vence Hoje!</span>
                      ) : (
                        `${item.daysToExpiry} dias`
                      )}
                    </td>
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
                        <Button 
                          onClick={() => handleApplyDiscount(item.product.id, item.product.name, item.product.price, item.suggestedDiscount)}
                          size="sm" 
                          className="h-8 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary-dark"
                        >
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
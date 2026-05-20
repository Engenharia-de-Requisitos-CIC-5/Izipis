import { Product } from '@/lib/types';

// Extendemos o tipo Product para incluir a propriedade customizada de velocidade de vendas
export interface PredictMockProduct extends Product {
  salesVelocity: number; // Média de vendas diárias usada pela lógica de ML
}

// =========================================================================
// CONFIGURAÇÃO DE CENÁRIOS DE TESTE PARA APRESENTAÇÃO
// Para alternar o cenário apresentado, basta descomentar um dos blocos abaixo
// e comentar os outros dois. O Hot Reload atualizará a tela automaticamente.
// =========================================================================

// =========================================================================
// CENÁRIO 1 (ATIVO): RISCO CRÍTICO E ALTO
// - Risco Alto de Vencimento (Estoque Alto + Venda Baixa + Validade Curta)
// - Risco Alto de Ruptura (Estoque Quase Zerado + Vendas Altas)
// =========================================================================
export const activePredictProducts: PredictMockProduct[] = [
  {
    id: 'ml1',
    name: 'Iogurte Natural Integral 170g',
    description: 'Iogurte natural sem conservantes.',
    price: 3.50,
    category: 'Laticínios',
    sku: '78920003',
    stock: 120,               // Quantidade alta em estoque
    salesVelocity: 0.5,       // Giro muito lento (0.5 un/dia)
    lote: 'L-IOG99',
    validade: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 3); // Vence em apenas 3 dias! (Risco Crítico de Perda)
      return d.toISOString().split('T')[0];
    })()
  },
  {
    id: 'ml2',
    name: 'Pão de Queijo Mineiro (500g)',
    description: 'Pão de queijo tradicional congelado.',
    price: 12.90,
    category: 'Padaria',
    sku: '78960002',
    stock: 2,                 // Estoque crítico (2 unidades)
    salesVelocity: 8.8,       // Giro altíssimo (8.8 un/dia)
    lote: 'L-PDQ12',
    validade: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 30); // Validade confortável
      return d.toISOString().split('T')[0];
    })()
  },
  {
    id: 'ml3',
    name: 'Carne Moída Patinho (500g)',
    description: 'Carne moída fresca congelada.',
    price: 24.50,
    category: 'Açougue',
    sku: '78980002',
    stock: 1,                 // Estoque crítico (1 unidade)
    salesVelocity: 4.5,       // Giro alto
    lote: 'L-PTN88',
    validade: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 5); // Vence em 5 dias e acabará hoje
      return d.toISOString().split('T')[0];
    })()
  },
  {
    id: 'ml4',
    name: 'Pão de Forma Tradicional',
    description: 'Pão fatiado macio tradicional.',
    price: 7.90,
    category: 'Padaria',
    sku: '78960004',
    stock: 50,
    salesVelocity: 7.3,
    lote: 'L-PDF80',
    validade: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2); // Vence em 2 dias (Risco Crítico de Perda)
      return d.toISOString().split('T')[0];
    })()
  },
  {
    id: 'ml5',
    name: 'Hambúrguer Bovino',
    description: 'Hambúrguer de carne bovina premium.',
    price: 22.00,
    category: 'Congelados',
    sku: '78980005',
    stock: 15,
    salesVelocity: 2.3,       // Fica sem estoque em ~7 dias (Lead time do fornecedor é 7 dias, RUPTURA IMINENTE)
    lote: 'L-HMB33',
    validade: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 60);
      return d.toISOString().split('T')[0];
    })()
  }
];


/*
// =========================================================================
// CENÁRIO 2: ESTOQUE EQUILIBRADO E SAUDÁVEL
// - Sem alertas de ruptura (estoque suficiente para cobrir demanda)
// - Sem perdas por validade (data de vencimento muito distante do giro de vendas)
// =========================================================================
export const activePredictProducts: PredictMockProduct[] = [
  {
    id: 'ml1',
    name: 'Iogurte Natural Integral 170g',
    description: 'Iogurte natural sem conservantes.',
    price: 3.50,
    category: 'Laticínios',
    sku: '78920003',
    stock: 45,
    salesVelocity: 1.5,
    lote: 'L-IOG99',
    validade: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 30); // Vence em 30 dias (Confortável)
      return d.toISOString().split('T')[0];
    })()
  },
  {
    id: 'ml2',
    name: 'Pão de Queijo Mineiro (500g)',
    description: 'Pão de queijo tradicional congelado.',
    price: 12.90,
    category: 'Padaria',
    sku: '78960002',
    stock: 100,
    salesVelocity: 5.0,
    lote: 'L-PDQ12',
    validade: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 60);
      return d.toISOString().split('T')[0];
    })()
  },
  {
    id: 'ml3',
    name: 'Carne Moída Patinho (500g)',
    description: 'Carne moída fresca congelada.',
    price: 24.50,
    category: 'Açougue',
    sku: '78980002',
    stock: 35,
    salesVelocity: 2.0,
    lote: 'L-PTN88',
    validade: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 20);
      return d.toISOString().split('T')[0];
    })()
  }
];
*/


/*
// =========================================================================
// CENÁRIO 3: REPOSIÇÃO PREVENTIVA E ALERTA LEVE
// - Produtos em nível de estoque moderado/alerta (acabando próximo do lead-time)
// - Validade segura
// =========================================================================
export const activePredictProducts: PredictMockProduct[] = [
  {
    id: 'ml1',
    name: 'Iogurte Natural Integral 170g',
    description: 'Iogurte natural sem conservantes.',
    price: 3.50,
    category: 'Laticínios',
    sku: '78920003',
    stock: 18,
    salesVelocity: 2.0,       // Acaba em 9 dias (Próximo do Lead Time de 7 dias = ALERTA)
    lote: 'L-IOG99',
    validade: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 25);
      return d.toISOString().split('T')[0];
    })()
  },
  {
    id: 'ml2',
    name: 'Pão de Queijo Mineiro (500g)',
    description: 'Pão de queijo tradicional congelado.',
    price: 12.90,
    category: 'Padaria',
    sku: '78960002',
    stock: 75,
    salesVelocity: 8.0,       // Acaba em 9.3 dias (ALERTA)
    lote: 'L-PDQ12',
    validade: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 45);
      return d.toISOString().split('T')[0];
    })()
  }
];
*/

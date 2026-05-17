export type UserRole = 'ADMIN' | 'VENDOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  minStock: number; // Adicionado: Limite para disparar o "indicador de estoque crítico"
  image?: string;
  sku: string; // SKU/EAN lido pelo leitor de código de barras
  lote?: string; // Adicionado: Controle de Lote para rastreabilidade
  validade?: string; // Adicionado: Data de validade (essencial para o futuro ML)
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'money' | 'card' | 'pix';
  timestamp: string;
  source: 'LOCAL' | 'IFOOD';
  customerName?: string;
}

// ==========================================
// NOVAS INTERFACES: Módulo de Recebimento
// ==========================================

export interface ReceiptItem {
  productId: string;
  name: string;
  quantity: number;
  lote?: string; // Produto perecível no recebimento
  validade?: string; // Data informada durante a leitura da NF
}

export interface Receipt {
  id: string;
  notaFiscal: string; // Obrigatório: "vinculação à nota fiscal"
  items: ReceiptItem[];
  timestamp: string;
  receivedBy: string; // ID do Estoquista/Recebedor
}
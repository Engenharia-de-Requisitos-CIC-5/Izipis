export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
  minStock?: number;
  lote?: string;
  validade?: string;
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
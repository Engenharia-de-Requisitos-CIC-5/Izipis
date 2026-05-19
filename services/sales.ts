import { Sale, SaleItem } from '@/lib/types';
import { updateStock } from './products';

const DEFAULT_SALES: Sale[] = [
  {
    id: "s101",
    items: [
      { productId: "p1", name: "Arroz Integral 1kg", quantity: 2, price: 8.50 },
      { productId: "p2", name: "Feijão Carioca 1kg", quantity: 1, price: 7.20 }
    ],
    total: 24.20,
    paymentMethod: "pix",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    source: "LOCAL"
  },
  {
    id: "s102",
    items: [
      { productId: "p11", name: "Refrigerante Cola 2L", quantity: 3, price: 9.50 },
      { productId: "p23", name: "Biscoito Recheado 140g", quantity: 5, price: 3.20 }
    ],
    total: 44.50,
    paymentMethod: "card",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: "IFOOD",
    customerName: "Carlos Silva"
  },
  {
    id: "s103",
    items: [
      { productId: "p6", name: "Café Torrado 500g", quantity: 1, price: 18.90 },
      { productId: "p7", name: "Leite Integral 1L", quantity: 4, price: 4.90 },
      { productId: "p22", name: "Pão Francês (Kg)", quantity: 0.5, price: 10.00 }
    ],
    total: 43.50,
    paymentMethod: "money",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    source: "LOCAL"
  },
  {
    id: "s104",
    items: [
      { productId: "p33", name: "Vinho Tinto Seco 750ml", quantity: 1, price: 28.90 },
      { productId: "p10", name: "Queijo Muçarela Fatiado 200g", quantity: 2, price: 15.90 }
    ],
    total: 60.70,
    paymentMethod: "pix",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    source: "IFOOD",
    customerName: "Mariana Souza"
  },
  {
    id: "s105",
    items: [
      { productId: "p15", name: "Detergente Líquido 500ml", quantity: 4, price: 2.80 },
      { productId: "p16", name: "Sabão em Pó 1kg", quantity: 1, price: 14.90 }
    ],
    total: 26.10,
    paymentMethod: "card",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    source: "LOCAL"
  },
  {
    id: "s106",
    items: [
      { productId: "p50", name: "Carne Moída Patinho (500g)", quantity: 2, price: 24.50 },
      { productId: "p43", name: "Cebola Branca (Kg)", quantity: 1.5, price: 4.80 }
    ],
    total: 56.20,
    paymentMethod: "pix",
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    source: "LOCAL"
  }
];

function getStoredSales(): Sale[] {
  if (typeof window === 'undefined') return DEFAULT_SALES;
  const stored = localStorage.getItem('izipis_sales');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('izipis_sales', JSON.stringify(DEFAULT_SALES));
  return DEFAULT_SALES;
}

function saveSales(sales: Sale[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('izipis_sales', JSON.stringify(sales));
  }
}

export async function createSale(sale: Omit<Sale, 'id' | 'timestamp'>): Promise<Sale> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newSale: Sale = {
    ...sale,
    id: `s${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  // Update stock for each item
  for (const item of sale.items) {
    await updateStock(item.productId, item.quantity);
  }

  const sales = getStoredSales();
  sales.push(newSale);
  saveSales(sales);
  
  return newSale;
}

export async function getSales(): Promise<Sale[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return getStoredSales();
}

export async function getDailyTotal(): Promise<number> {
  const sales = await getSales();
  const today = new Date().toISOString().split('T')[0];
  return sales
    .filter(s => s.timestamp.startsWith(today))
    .reduce((acc, s) => acc + s.total, 0);
}

export async function getSalesStats() {
  const sales = await getSales();
  
  // Basic stats for dashboard
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalOrders = sales.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Categorize by source
  const ifoodSales = sales.filter(s => s.source === 'IFOOD').length;
  const localSales = sales.filter(s => s.source === 'LOCAL').length;
  
  return {
    totalRevenue,
    totalOrders,
    avgTicket,
    ifoodSales,
    localSales,
    recentSales: sales.slice(-5).reverse()
  };
}

import { Sale, SaleItem } from '@/lib/types';
import { updateStock } from './products';

const DEFAULT_SALES: Sale[] = [];

function getStoredSales(): Sale[] {
  if (typeof window === 'undefined') return DEFAULT_SALES;
  const stored = localStorage.getItem('izipis_sales');
  if (stored) return JSON.parse(stored);
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

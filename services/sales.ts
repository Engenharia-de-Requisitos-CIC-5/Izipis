import { Sale, SaleItem } from '@/lib/types';
import { updateStock } from './products';

const MOCK_SALES: Sale[] = [];

export async function createSale(sale: Omit<Sale, 'id' | 'timestamp'>): Promise<Sale> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const newSale: Sale = {
    ...sale,
    id: `s${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  // Update stock for each item
  for (const item of sale.items) {
    await updateStock(item.productId, item.quantity);
  }

  MOCK_SALES.push(newSale);
  return newSale;
}

export async function getSales(): Promise<Sale[]> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return MOCK_SALES;
}

export async function getDailyTotal(): Promise<number> {
  const sales = await getSales();
  const today = new Date().toISOString().split('T')[0];
  return sales
    .filter(s => s.timestamp.startsWith(today))
    .reduce((acc, s) => acc + s.total, 0);
}

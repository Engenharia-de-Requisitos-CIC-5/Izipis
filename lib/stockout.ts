import { Product, Sale } from '@/lib/types';
import { activePredictProducts } from '@/services/mockPredictData';

const LEAD_TIME_DAYS = 7;
const ALERT_WINDOW_DAYS = 5;
const DEFAULT_VELOCITY = 1.2;
const RISK_CATEGORIES = ['Laticínios', 'Congelados', 'Açougue', 'Padaria'];

function getMockVelocity(product: Product) {
  const mock = activePredictProducts.find((item) => item.sku === product.sku);
  return mock?.salesVelocity ?? DEFAULT_VELOCITY;
}

function calculateVelocity(product: Product, sales: Sale[]) {
  const baseVelocity = getMockVelocity(product);
  const itemSales = sales.flatMap((sale) =>
    sale.items
      .filter((item) => item.productId === product.id)
      .map((item) => ({ qty: item.quantity, timestamp: sale.timestamp }))
  );

  if (itemSales.length === 0) {
    return baseVelocity;
  }

  const totalSold = itemSales.reduce((acc, item) => acc + item.qty, 0);
  const timestamps = itemSales.map((item) => new Date(item.timestamp).getTime());
  const minTime = Math.min(...timestamps);
  const diffDays = Math.max(1, Math.ceil((Date.now() - minTime) / (1000 * 3600 * 24)));
  const realAvg = totalSold / diffDays;
  const velocity = Number((0.7 * realAvg + 0.3 * baseVelocity).toFixed(1));
  return Math.max(0.1, velocity);
}

function getProductStockoutRisk(product: Product, velocity: number) {
  const daysToSellOut = product.stock / velocity;

  if (daysToSellOut <= LEAD_TIME_DAYS) {
    return { status: 'CRITICO' as const, stockoutRisk: 90 + Math.max(0, (LEAD_TIME_DAYS - daysToSellOut) / LEAD_TIME_DAYS) * 10 };
  }

  if (daysToSellOut <= LEAD_TIME_DAYS + ALERT_WINDOW_DAYS) {
    return { status: 'ALERTA' as const, stockoutRisk: 60 + Math.max(0, ((LEAD_TIME_DAYS + ALERT_WINDOW_DAYS) - daysToSellOut) / ALERT_WINDOW_DAYS) * 20 };
  }

  return { status: 'SAUDAVEL' as const, stockoutRisk: Math.min(59, (LEAD_TIME_DAYS / daysToSellOut) * 100) };
}

export function getPredictedStockoutRiskCount(products: Product[], sales: Sale[]) {
  return products
    .filter((product) =>
      RISK_CATEGORIES.includes(product.category) || Boolean(product.validade)
    )
    .filter((product) => {
      const velocity = calculateVelocity(product, sales);
      const { status } = getProductStockoutRisk(product, velocity);
      return status === 'CRITICO' || status === 'ALERTA';
    }).length;
}

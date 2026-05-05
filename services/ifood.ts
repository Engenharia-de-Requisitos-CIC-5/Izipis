import { Sale, SaleItem } from '@/lib/types';
import { getProducts, updateStock } from './products';

// iFood API Simulation Constants
const IFOOD_API_BASE = 'https://merchant-api.ifood.com.br/v1.0';

export interface IfoodOrder {
  id: string;
  displayId: string;
  createdAt: string;
  orderType: 'DELIVERY' | 'TAKEOUT';
  orderTimestamp: string;
  salesChannel: 'IFOOD';
  total: {
    subTotal: number;
    deliveryFee: number;
    benefits: number;
    orderAmount: number;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  customer: {
    id: string;
    name: string;
    document?: string;
  };
}

/**
 * Simula a autenticação com a API do iFood via OAuth2.
 * Em um cenário real, você usaria client_id e client_secret para obter um access_token.
 */
export async function authenticateIfood(): Promise<string> {
  console.log('Autenticando com iFood...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  return 'simulated_access_token_' + Math.random().toString(36).substring(7);
}

/**
 * Simula a busca de novos eventos de pedidos (Polling).
 * O iFood utiliza um sistema de polling onde você consome eventos e depois faz o 'acknowledge'.
 */
export async function pollNewOrders(): Promise<IfoodOrder[]> {
  // Simula um delay de rede
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simula a chance de chegar um novo pedido (30% de chance para a demo)
  if (Math.random() > 0.7) {
    const products = await getProducts();
    const randomProduct = products[Math.floor(Math.random() * products.length)];

    const subTotal = randomProduct.price * 2;
    const deliveryFee = 5.90;

    return [{
      id: `ifood-${Math.random().toString(36).substring(7)}`,
      displayId: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: new Date().toISOString(),
      orderType: 'DELIVERY',
      orderTimestamp: new Date().toISOString(),
      salesChannel: 'IFOOD',
      total: {
        subTotal,
        deliveryFee,
        benefits: 0,
        orderAmount: subTotal + deliveryFee
      },
      items: [{
        id: randomProduct.id,
        name: randomProduct.name,
        quantity: 2,
        unitPrice: randomProduct.price,
        totalPrice: subTotal
      }],
      customer: {
        id: 'c-123',
        name: 'Cliente iFood Simulado',
      }
    }];
  }

  return [];
}

/**
 * Integra um pedido do iFood ao sistema interno Izipis.
 * Isso converte o formato do iFood para o formato interno de Sale e atualiza o estoque.
 */
export async function integrateIfoodOrder(ifoodOrder: IfoodOrder): Promise<Sale> {
  const sale: Omit<Sale, 'id' | 'timestamp'> = {
    items: ifoodOrder.items.map(item => ({
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.unitPrice
    })),
    total: ifoodOrder.total.orderAmount,
    paymentMethod: 'pix', // iFood geralmente repassa via PIX ou Crédito Online
    source: 'IFOOD' as any // Estendendo o tipo para suportar origem
  };

  // Persiste no nosso sistema de vendas
  const { createSale } = await import('./sales');
  return await createSale(sale);
}

/**
 * Simula a atualização do status do pedido no iFood (Confirmação).
 */
export async function confirmIfoodOrder(orderId: string): Promise<boolean> {
  console.log(`Confirmando pedido ${orderId} no iFood...`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
}

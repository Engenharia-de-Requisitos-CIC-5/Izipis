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

const MOCK_CLIENTS = [
  { id: 'c1', name: 'Maria Silva', document: '123.456.789-00' },
  { id: 'c2', name: 'João Pereira', document: '987.654.321-11' },
  { id: 'c3', name: 'Ana Oliveira', document: '456.789.123-22' },
  { id: 'c4', name: 'Pedro Santos', document: '321.654.987-33' }
];

/**
 * Simula a busca de novos eventos de pedidos (Polling).
 */
export async function pollNewOrders(): Promise<IfoodOrder[]> {
  // Simula um delay de rede
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 40% de chance de chegar um novo pedido para a demo
  if (Math.random() > 0.6) {
    const products = await getProducts();
    const client = MOCK_CLIENTS[Math.floor(Math.random() * MOCK_CLIENTS.length)];
    
    // Escolhe de 1 a 3 produtos aleatórios
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedItems = [];
    let subTotal = 0;

    for (let i = 0; i < numItems; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 2) + 1;
      const totalItem = product.price * qty;
      
      selectedItems.push({
        id: product.id,
        name: product.name,
        quantity: qty,
        unitPrice: product.price,
        totalPrice: totalItem
      });
      subTotal += totalItem;
    }

    const deliveryFee = 7.90;

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
      items: selectedItems,
      customer: client
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

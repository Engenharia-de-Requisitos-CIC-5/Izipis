import { Product } from '@/lib/types';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Arroz Integral 1kg',
    description: 'Arroz integral de alta qualidade.',
    price: 8.50,
    category: 'Grãos',
    stock: 45,
    sku: 'GR001',
  },
  {
    id: 'p2',
    name: 'Feijão Carioca 1kg',
    description: 'Feijão carioca selecionado.',
    price: 7.20,
    category: 'Grãos',
    stock: 30,
    sku: 'GR002',
  },
  {
    id: 'p3',
    name: 'Leite Integral 1L',
    description: 'Leite UHT integral.',
    price: 4.90,
    category: 'Laticínios',
    stock: 100,
    sku: 'LA001',
  },
  {
    id: 'p4',
    name: 'Café Torrado 500g',
    description: 'Café gourmet torrado e moído.',
    price: 18.90,
    category: 'Bebidas',
    stock: 15,
    sku: 'BE001',
  },
  {
    id: 'p5',
    name: 'Óleo de Soja 900ml',
    description: 'Óleo de soja refinado.',
    price: 6.50,
    category: 'Mercearia',
    stock: 60,
    sku: 'ME001',
  },
];

export async function getProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_PRODUCTS;
}

export async function getProductById(id: string): Promise<Product | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_PRODUCTS.find(p => p.id === id) || null;
}

export async function updateStock(id: string, quantity: number): Promise<boolean> {
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  if (product) {
    product.stock -= quantity;
    return true;
  }
  return false;
}

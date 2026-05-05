import { Product } from '@/lib/types';

const MOCK_PRODUCTS: Product[] = [
  // Mercearia & Grãos
  { id: 'p1', name: 'Arroz Integral 1kg', description: 'Arroz integral de alta qualidade.', price: 8.50, category: 'Mercearia', stock: 45, sku: '78910001' },
  { id: 'p2', name: 'Feijão Carioca 1kg', description: 'Feijão carioca selecionado.', price: 7.20, category: 'Mercearia', stock: 30, sku: '78910002' },
  { id: 'p3', name: 'Óleo de Soja 900ml', description: 'Óleo de soja refinado.', price: 6.50, category: 'Mercearia', stock: 60, sku: '78910003' },
  { id: 'p4', name: 'Macarrão Espaguete 500g', description: 'Macarrão de sêmola.', price: 4.20, category: 'Mercearia', stock: 80, sku: '78910004' },
  { id: 'p5', name: 'Açúcar Refinado 1kg', description: 'Açúcar branco extra fino.', price: 4.80, category: 'Mercearia', stock: 55, sku: '78910005' },
  { id: 'p6', name: 'Café Torrado 500g', description: 'Café gourmet torrado e moído.', price: 18.90, category: 'Mercearia', stock: 25, sku: '78910006' },
  { id: 'p23', name: 'Biscoito Recheado 140g', description: 'Biscoito sabor chocolate.', price: 3.20, category: 'Mercearia', stock: 110, sku: '78910007' },
  { id: 'p26', name: 'Sal Refinado 1kg', description: 'Sal iodado extra fino.', price: 2.90, category: 'Mercearia', stock: 40, sku: '78910008' },
  { id: 'p27', name: 'Farinha de Trigo 1kg', description: 'Farinha tipo 1 premium.', price: 5.40, category: 'Mercearia', stock: 70, sku: '78910009' },
  { id: 'p28', name: 'Maionese 500g', description: 'Maionese cremosa tradicional.', price: 7.80, category: 'Mercearia', stock: 45, sku: '78910010' },
  { id: 'p29', name: 'Ketchup 400g', description: 'Ketchup tradicional.', price: 8.50, category: 'Mercearia', stock: 30, sku: '78910011' },

  // Laticínios
  { id: 'p7', name: 'Leite Integral 1L', description: 'Leite UHT integral.', price: 4.90, category: 'Laticínios', stock: 120, sku: '78920001' },
  { id: 'p8', name: 'Manteiga com Sal 200g', description: 'Manteiga de primeira qualidade.', price: 12.50, category: 'Laticínios', stock: 40, sku: '78920002' },
  { id: 'p9', name: 'Iogurte Natural 170g', description: 'Iogurte integral sem açúcar.', price: 3.50, category: 'Laticínios', stock: 65, sku: '78920003' },
  { id: 'p10', name: 'Queijo Muçarela Fatiado 200g', description: 'Muçarela de búfala.', price: 15.90, category: 'Laticínios', stock: 35, sku: '78920004' },
  { id: 'p30', name: 'Queijo Prato Fatiado 200g', description: 'Queijo prato tradicional.', price: 14.20, category: 'Laticínios', stock: 25, sku: '78920005' },
  { id: 'p31', name: 'Requeijão Cremoso 200g', description: 'Requeijão tradicional.', price: 9.80, category: 'Laticínios', stock: 50, sku: '78920006' },
  { id: 'p32', name: 'Creme de Leite 200g', description: 'Creme de leite UHT.', price: 3.20, category: 'Laticínios', stock: 80, sku: '78920007' },

  // Bebidas
  { id: 'p11', name: 'Refrigerante Cola 2L', description: 'Bebida gaseificada refrescante.', price: 9.50, category: 'Bebidas', stock: 90, sku: '78930001' },
  { id: 'p12', name: 'Suco de Laranja 1L', description: 'Suco 100% natural pasteurizado.', price: 11.20, category: 'Bebidas', stock: 50, sku: '78930002' },
  { id: 'p13', name: 'Água Mineral 500ml', description: 'Água sem gás refrescante.', price: 2.50, category: 'Bebidas', stock: 200, sku: '78930003' },
  { id: 'p14', name: 'Cerveja Lata 350ml', description: 'Cerveja pilsen puro malte.', price: 4.50, category: 'Bebidas', stock: 150, sku: '78930004' },
  { id: 'p33', name: 'Vinho Tinto Seco 750ml', description: 'Vinho de mesa nacional.', price: 28.90, category: 'Bebidas', stock: 20, sku: '78930005' },
  { id: 'p34', name: 'Energético 250ml', description: 'Bebida energética taurina.', price: 8.90, category: 'Bebidas', stock: 40, sku: '78930006' },
  { id: 'p35', name: 'Chá Gelado Limão 1.5L', description: 'Ice tea refrescante.', price: 7.50, category: 'Bebidas', stock: 35, sku: '78930007' },

  // Limpeza
  { id: 'p15', name: 'Detergente Líquido 500ml', description: 'Detergente neutro para louças.', price: 2.80, category: 'Limpeza', stock: 100, sku: '78940001' },
  { id: 'p16', name: 'Sabão em Pó 1kg', description: 'Lava roupas ultra performance.', price: 14.90, category: 'Limpeza', stock: 45, sku: '78940002' },
  { id: 'p17', name: 'Desinfetante Lavanda 1L', description: 'Desinfetante multiuso perfumado.', price: 8.20, category: 'Limpeza', stock: 60, sku: '78940003' },
  { id: 'p18', name: 'Papel Higiênico (12 rolos)', description: 'Folha dupla de alta maciez.', price: 22.50, category: 'Limpeza', stock: 30, sku: '78940004' },
  { id: 'p36', name: 'Amaciante de Roupas 2L', description: 'Perfume duradouro.', price: 18.50, category: 'Limpeza', stock: 25, sku: '78940005' },
  { id: 'p37', name: 'Água Sanitária 1L', description: 'Cloro ativo.', price: 4.50, category: 'Limpeza', stock: 50, sku: '78940006' },
  { id: 'p38', name: 'Esponja de Aço (3 unid)', description: 'Limpeza pesada.', price: 3.90, category: 'Limpeza', stock: 40, sku: '78940007' },

  // Higiene Pessoal
  { id: 'p19', name: 'Sabonete em Barra 90g', description: 'Sabonete hidratante suave.', price: 2.30, category: 'Higiene', stock: 150, sku: '78950001' },
  { id: 'p20', name: 'Creme Dental 90g', description: 'Proteção total anticáries.', price: 5.90, category: 'Higiene', stock: 85, sku: '78950002' },
  { id: 'p21', name: 'Shampoo Neutro 400ml', description: 'Shampoo para todos os tipos de cabelo.', price: 16.50, category: 'Higiene', stock: 40, sku: '78950003' },
  { id: 'p39', name: 'Condicionador Neutro 400ml', description: 'Cuidado diário.', price: 18.20, category: 'Higiene', stock: 30, sku: '78950004' },
  { id: 'p40', name: 'Desodorante Aerosol 150ml', description: 'Proteção 48h.', price: 14.50, category: 'Higiene', stock: 55, sku: '78950005' },
  { id: 'p41', name: 'Fio Dental 50m', description: 'Limpeza profunda.', price: 9.90, category: 'Higiene', stock: 20, sku: '78950006' },

  // Hortifruti
  { id: 'p24', name: 'Maçã Fuji (Kg)', description: 'Maçãs frescas e crocantes.', price: 9.80, category: 'Hortifruti', stock: 20, sku: '78970001' },
  { id: 'p25', name: 'Banana Nanica (Dúzia)', description: 'Bananas maduras selecionadas.', price: 6.50, category: 'Hortifruti', stock: 15, sku: '78970002' },
  { id: 'p42', name: 'Batata Inglesa (Kg)', description: 'Ideal para fritar.', price: 5.90, category: 'Hortifruti', stock: 40, sku: '78970003' },
  { id: 'p43', name: 'Cebola Branca (Kg)', description: 'Cebola selecionada.', price: 4.80, category: 'Hortifruti', stock: 30, sku: '78970004' },
  { id: 'p44', name: 'Tomate Italiano (Kg)', description: 'Perfeito para molhos.', price: 8.90, category: 'Hortifruti', stock: 25, sku: '78970005' },
  { id: 'p45', name: 'Alface Crespa (Unid)', description: 'Folhas frescas.', price: 3.50, category: 'Hortifruti', stock: 15, sku: '78970006' },

  // Padaria
  { id: 'p22', name: 'Pão de Forma Tradicional', description: 'Pão fatiado macio.', price: 7.90, category: 'Padaria', stock: 50, sku: '78960001' },
  { id: 'p46', name: 'Pão Francês (Kg)', description: 'Sempre quentinho.', price: 18.50, category: 'Padaria', stock: 10, sku: '78960002' },
  { id: 'p47', name: 'Bolo de Cenoura', description: 'Caseiro com cobertura.', price: 15.00, category: 'Padaria', stock: 5, sku: '78960003' },
  { id: 'p48', name: 'Pão de Queijo (500g)', description: 'Congelado ou assado.', price: 12.90, category: 'Padaria', stock: 20, sku: '78960004' },

  // Açougue & Congelados
  { id: 'p49', name: 'Peito de Frango (Kg)', description: 'Resfriado.', price: 19.90, category: 'Açougue', stock: 15, sku: '78980001' },
  { id: 'p50', name: 'Carne Moída Patinho (500g)', description: 'Carne magra.', price: 24.50, category: 'Açougue', stock: 10, sku: '78980002' },
  { id: 'p51', name: 'Pizza Congelada Calabresa', description: 'Pronta em 15 min.', price: 16.90, category: 'Congelados', stock: 30, sku: '78980003' },
  { id: 'p52', name: 'Lasanha à Bolonhesa 600g', description: 'Sabor caseiro.', price: 14.80, category: 'Congelados', stock: 25, sku: '78980004' },
  { id: 'p53', name: 'Hambúrguer Bovino (12 unid)', description: 'Carne bovina.', price: 22.00, category: 'Congelados', stock: 15, sku: '78980005' },

  // Pet Shop
  { id: 'p54', name: 'Ração para Cães 1kg', description: 'Sabor carne e vegetais.', price: 18.90, category: 'Pet Shop', stock: 40, sku: '78990001' },
  { id: 'p55', name: 'Ração para Gatos 1kg', description: 'Sabor salmão.', price: 21.50, category: 'Pet Shop', stock: 35, sku: '78990002' },
  { id: 'p56', name: 'Petisco para Cães', description: 'Stick de carne.', price: 6.50, category: 'Pet Shop', stock: 50, sku: '78990003' },
  { id: 'p57', name: 'Areia Higiênica 4kg', description: 'Alta absorção.', price: 24.90, category: 'Pet Shop', stock: 20, sku: '78990004' },

  // Bazar
  { id: 'p58', name: 'Lâmpada LED 9W', description: 'Branca fria.', price: 12.50, category: 'Bazar', stock: 60, sku: '78901001' },
  { id: 'p59', name: 'Pilha AA (4 unid)', description: 'Alcalina.', price: 18.90, category: 'Bazar', stock: 100, sku: '78901002' },
  { id: 'p60', name: 'Vassoura Multiuso', description: 'Cerdas macias.', price: 15.80, category: 'Bazar', stock: 15, sku: '78901003' },
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

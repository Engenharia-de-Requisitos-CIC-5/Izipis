'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Barcode, 
  Package, 
  Hash, 
  Calendar, 
  Trash2,
  Building2,
  Save,
  UploadCloud
} from 'lucide-react';
import { getProducts, getProductById, updateProduct } from '@/services/products';
import { Product } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const getDefaultLote = (sku: string) => `LT-${sku.slice(-4)}-${new Date().getFullYear()}`;
const getDefaultValidade = () => new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0];
const areProductsEqual = (current: Product[], next: Product[]) => {
  if (current.length !== next.length) return false;
  const currentById = new Map(current.map(prod => [prod.id, prod]));
  for (const prod of next) {
    const existing = currentById.get(prod.id);
    if (!existing) return false;
    if (
      existing.sku !== prod.sku ||
      existing.name !== prod.name ||
      existing.description !== prod.description ||
      existing.category !== prod.category ||
      existing.price !== prod.price ||
      existing.stock !== prod.stock ||
      existing.minStock !== prod.minStock
    ) {
      return false;
    }
  }
  return true;
};

interface ReceiptItem {
  product: Product;
  quantity: number;
  lote: string;
  validade: string;
}

export default function RecebimentoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const productsRef = useRef<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Dados da Nota Fiscal
  const [nfData, setNfData] = useState({
    numeroNF: '',
    fornecedor: ''
  });

  // Itens sendo recebidos
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  
  // Produto selecionado aguardando preenchimento
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemForm, setItemForm] = useState({
    quantity: '1',
    lote: '',
    validade: ''
  });
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualSkuInput, setManualSkuInput] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  async function loadProducts() {
    const data = await getProducts();
    if (!areProductsEqual(productsRef.current, data)) {
      productsRef.current = data;
      setProducts(data);
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sku = params.get('sku');
      const qty = params.get('qty');
      if (sku) {
        const prod = data.find(p => p.sku === sku);
        if (prod) {
          setSelectedProduct(prod);
          setItemForm({
            quantity: qty || '1',
            lote: getDefaultLote(prod.sku),
            validade: getDefaultValidade()
          });
          setNfData({
            numeroNF: `NFE-${Math.floor(100000 + Math.random() * 900000)}`,
            fornecedor: 'DISTRIBUIDORA ALIMENTAR S.A.'
          });
        }
      }
    }
  }

  useEffect(() => {
    const initialize = async () => {
      await loadProducts();
    };
    initialize();
    return () => undefined;
  }, []);

  const handleCancelSelectedProduct = () => {
    setSelectedProduct(null);
    if (receiptItems.length === 0) {
      setNfData({ numeroNF: '', fornecedor: '' });
    }
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm) {
      const product = products.find(p => 
        p.sku.toLowerCase() === searchTerm.toLowerCase() || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (product) {
        setSelectedProduct(product);
        setSearchTerm('');
      } else {
        alert('Produto não encontrado! Verifique o SKU ou cadastre no Estoque primeiro.');
      }
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setReceiptItems(prev => [...prev, {
      product: selectedProduct,
      quantity: parseInt(itemForm.quantity) || 1,
      lote: itemForm.lote,
      validade: itemForm.validade
    }]);

    setSelectedProduct(null);
    setItemForm({ quantity: '1', lote: '', validade: '' });
    searchInputRef.current?.focus();
  };

  const handleRemoveItem = (index: number) => {
    setReceiptItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm('');
    setItemForm({
      quantity: '1',
      lote: getDefaultLote(product.sku),
      validade: getDefaultValidade()
    });
  };

  const simulateScan = (sku: string) => {
    const product = products.find(p => p.sku === sku);
    if (product) {
      handleSelectProduct(product);
      setIsScannerOpen(false);
    }
  };

  const handleManualScanSubmit = () => {
    if (!manualSkuInput.trim()) return;
    const product = products.find(p => p.sku === manualSkuInput.trim());
    if (product) {
      handleSelectProduct(product);
      setManualSkuInput('');
      setIsScannerOpen(false);
    } else {
      alert('Produto com este código (SKU) não foi encontrado.');
    }
  };

  // INTEGRAÇÃO DE LEITURA DE XML (SIMULADA)
  const handleSimulateXmlImport = async () => {
    setIsImporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setNfData({
      numeroNF: '3526 0512 3456 7890 1234 5500 1000 0001 2345 6789',
      fornecedor: 'DISTRIBUIDORA ALIMENTAR SUL S/A'
    });

    const currentProducts = await getProducts();
    
    // Dados para disparar a IA na apresentação
    const xmlItems = [
      { sku: '78910001', name: 'Arroz Integral 1kg', quantity: 120, lote: 'LT-ARR-2026', validade: '2026-12-20' },
      { sku: '78920001', name: 'Leite Integral 1L', quantity: 80, lote: 'LT-LEITE-A', validade: '2026-05-19' },
      { sku: '78980001', name: 'Peito de Frango 1kg', quantity: 50, lote: 'LT-FRG-05', validade: '2026-06-01' }
    ];

    const newReceiptItems: ReceiptItem[] = xmlItems.map(item => {
      let prod = currentProducts.find(p => p.sku === item.sku);
      if (!prod) {
        prod = {
          id: `prod_${item.sku}`,
          name: item.name,
          sku: item.sku,
          description: 'Importado via XML',
          price: 0,
          category: 'Geral',
          stock: 0,
          minStock: 10
        };
      }
      return {
        product: prod,
        quantity: item.quantity,
        lote: item.lote,
        validade: item.validade
      };
    });

    setReceiptItems(prev => [...prev, ...newReceiptItems]);
    setIsImporting(false);
  };

  // INTEGRAÇÃO REAL COM O BANCO DE DADOS (LOCALSTORAGE)
  const handleFinalizeReceipt = async () => {
    if (!nfData.numeroNF || !nfData.fornecedor) {
      alert('Preencha os dados da Nota Fiscal e o Fornecedor antes de finalizar.');
      return;
    }
    if (receiptItems.length === 0) {
      alert('Adicione pelo menos um produto para receber.');
      return;
    }

    setIsSaving(true);

    try {
      // Atualiza cada produto no banco de dados local
      for (const item of receiptItems) {
        const currentProduct = await getProductById(item.product.id);
        
        if (currentProduct) {
          await updateProduct(item.product.id, {
            stock: currentProduct.stock + item.quantity, // Soma o estoque real
            lote: item.lote,                             // Atualiza para a IA ler
            validade: item.validade                      // Atualiza para a IA ler
          });
        }
      }

      alert('Recebimento finalizado com sucesso! O estoque e a IA foram atualizados.');
      
      // Limpa a tela após salvar
      setNfData({ numeroNF: '', fornecedor: '' });
      setReceiptItems([]);
      loadProducts(); // Recarrega os produtos atualizados
      
    } catch (error) {
      alert('Erro ao salvar o recebimento. Tente novamente.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Recebimento de Mercadorias</h1>
          <p className="text-foreground/60 font-medium">Vincule entradas à Nota Fiscal e registre lotes para a Inteligência Artificial.</p>
        </div>
        <Button 
          onClick={handleSimulateXmlImport}
          disabled={isImporting || isSaving}
          className="bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest gap-2 h-12 px-6 rounded-xl border-none shadow-lg shadow-primary/10"
        >
          <UploadCloud className={cn("w-5 h-5", isImporting && "animate-bounce")} />
          {isImporting ? 'LENDO XML DA NOTA...' : 'IMPORTAR NF-e (XML)'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: Formulários */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dados da NF */}
          <Card className="border-primary/5 shadow-sm p-6 bg-white">
            <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              1. Dados da Nota Fiscal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Chave / Número da NF-e</label>
                <div className="relative">
                  <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20" />
                  <input 
                    type="text" 
                    value={nfData.numeroNF}
                    onChange={(e) => setNfData({...nfData, numeroNF: e.target.value})}
                    placeholder="Digite o código da NF"
                    className="w-full bg-[#F1F5F9] border border-transparent rounded-xl py-3 pl-12 pr-4 text-primary font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Fornecedor</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20" />
                  <input 
                    type="text" 
                    value={nfData.fornecedor}
                    onChange={(e) => setNfData({...nfData, fornecedor: e.target.value})}
                    placeholder="Nome do fornecedor"
                    className="w-full bg-[#F1F5F9] border border-transparent rounded-xl py-3 pl-12 pr-4 text-primary font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Adicionar Produto */}
          <Card className="border-primary/5 shadow-sm p-6 bg-white">
            <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-secondary" />
              2. Bipar e Adicionar Produtos
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="Escaneie o código do produto ou digite o SKU (Aperte Enter)" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    onKeyDown={handleSearchKeyDown}
                    className="w-full bg-white border border-primary/20 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold" 
                  />
                </div>
                <Button 
                  variant="outline"
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="gap-2 h-10 px-4 border-primary/10 hover:bg-primary/5 group"
                >
                  <Barcode className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
                  <span>Ativar Leitor</span>
                </Button>
              </div>

              <AnimatePresence>
                {selectedProduct && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddItem}
                    className="bg-primary/5 border border-primary/10 rounded-2xl p-5 overflow-hidden"
                  >
                    <div className="mb-4 pb-4 border-b border-primary/10 flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-lg text-primary">{selectedProduct.name}</h3>
                        <p className="text-xs font-mono text-primary/50">SKU: {selectedProduct.sku} | Estoque Atual: {selectedProduct.stock}</p>
                      </div>
                      <Badge variant="outline" className="bg-white border-primary/20">{selectedProduct.category}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Qtd. Recebida</label>
                        <input 
                          type="number" 
                          min="1"
                          required
                          value={itemForm.quantity}
                          onChange={(e) => setItemForm({...itemForm, quantity: e.target.value})}
                          className="w-full bg-white border border-transparent rounded-xl py-2.5 px-4 text-primary font-bold focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Lote</label>
                        <input 
                          type="text"
                          required
                          value={itemForm.lote}
                          onChange={(e) => setItemForm({...itemForm, lote: e.target.value})}
                          placeholder="Obrigatório"
                          className="w-full bg-white border border-transparent rounded-xl py-2.5 px-4 text-primary font-bold focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Data de Validade</label>
                        <input 
                          type="date"
                          required
                          value={itemForm.validade}
                          onChange={(e) => setItemForm({...itemForm, validade: e.target.value})}
                          className="w-full bg-white border border-transparent rounded-xl py-2.5 px-4 text-primary font-bold focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button type="button" variant="ghost" onClick={handleCancelSelectedProduct} className="flex-1">Cancelar</Button>
                      <Button type="submit" className="flex-[2] bg-secondary hover:bg-secondary/90 text-white font-bold">Adicionar à Nota</Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        {/* COLUNA DIREITA: Resumo da Entrada */}
        <div className="lg:col-span-1">
          <Card className="border-primary/5 shadow-sm bg-white flex flex-col h-full min-h-[500px]">
            <div className="p-5 border-b border-primary/5 bg-[#F8FAFC]">
              <h2 className="text-lg font-bold text-primary flex items-center justify-between">
                Itens da Nota
                <Badge variant="secondary">{receiptItems.length}</Badge>
              </h2>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
              {receiptItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-primary/30 text-center space-y-2 pt-10">
                  <Package className="w-12 h-12 stroke-[1]" />
                  <p className="font-bold text-sm">Nenhum produto adicionado</p>
                  <p className="text-[10px] uppercase tracking-widest">BIPE UM ITEM PARA INICIAR</p>
                </div>
              ) : (
                receiptItems.map((item, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={index} 
                    className="bg-[#F8FAFC] border border-primary/10 rounded-xl p-3 relative group"
                  >
                    <button 
                      onClick={() => handleRemoveItem(index)}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-lg text-danger opacity-0 group-hover:opacity-100 transition-opacity border border-danger/10 hover:bg-danger hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <p className="font-black text-sm text-primary pr-8 truncate leading-tight">{item.product.name}</p>
                    <div className="flex justify-between items-end mt-2">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-mono text-primary/60 flex items-center gap-1"><Hash className="w-3 h-3" /> L: {item.lote}</p>
                        <p className="text-[10px] font-mono text-amber-600 font-bold flex items-center gap-1"><Calendar className="w-3 h-3" /> V: {item.validade}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest block">QTD</span>
                        <span className="text-lg font-black text-primary leading-none">+{item.quantity}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-5 border-t border-primary/5 bg-[#F8FAFC]">
              <Button 
                onClick={handleFinalizeReceipt}
                disabled={receiptItems.length === 0 || isSaving}
                className="w-full py-6 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-[0.1em] gap-2"
              >
                <Save className="w-5 h-5" /> {isSaving ? 'Salvando...' : 'Confirmar Entrada'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
      {isScannerOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 z-[100] bg-primary/95 backdrop-blur-md flex items-center justify-center p-8"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-6 bg-[#F8FAFC] border-b border-primary/5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <Barcode className="w-6 h-6 text-secondary" />
                <h2 className="text-xl font-black text-primary uppercase tracking-tight">Leitor de Código</h2>
              </div>
              <Button variant="ghost" onClick={() => setIsScannerOpen(false)}>Fechar</Button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden">
              <div className="space-y-4">
                <div className="aspect-square bg-black rounded-2xl relative overflow-hidden flex items-center justify-center border-4 border-secondary/20">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                  <Barcode className="w-32 h-32 text-white/10" />
                  <div className="absolute inset-x-0 top-1/2 h-1 bg-secondary shadow-[0_0_15px_rgba(var(--secondary-rgb),0.5)] animate-scan" />
                  <div className="absolute inset-0 border-[40px] border-black/40" />
                </div>
                <p className="text-center text-xs font-bold text-primary/40 uppercase tracking-widest">Aponte o código para o leitor ou digite abaixo</p>
              </div>
              <div className="flex flex-col min-h-0">
                <div className="mb-4 space-y-2">
                  <label className="text-xs font-bold text-primary/60 uppercase tracking-wider block">Digitar Código (SKU)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ex: 78960002"
                      value={manualSkuInput}
                      onChange={(e) => setManualSkuInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleManualScanSubmit();
                        }
                      }}
                      className="flex-1 bg-white border border-primary/10 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-sans"
                    />
                    <Button 
                      onClick={handleManualScanSubmit}
                      className="bg-secondary text-white hover:bg-secondary/90 px-4 rounded-xl text-xs font-black uppercase tracking-widest"
                    >
                      Bipar
                    </Button>
                  </div>
                </div>
                <h3 className="font-bold text-primary mb-2">Seleção Rápida:</h3>
                <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {products.map(product => (
                    <button
                      key={product.id}
                      onClick={() => simulateScan(product.sku)}
                      className="w-full text-left p-3 rounded-xl border border-primary/5 hover:border-secondary hover:bg-secondary/5 transition-all group flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-sm text-primary group-hover:text-secondary">{product.name}</p>
                        <p className="text-[10px] font-mono text-primary/40">{product.sku}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-primary text-sm">QTD no estoque: {product.stock}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
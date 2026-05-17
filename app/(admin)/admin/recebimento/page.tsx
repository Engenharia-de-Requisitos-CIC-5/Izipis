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
  Save
} from 'lucide-react';
import { getProducts, getProductById, updateProduct } from '@/services/products';
import { Product } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ReceiptItem {
  product: Product;
  quantity: number;
  lote: string;
  validade: string;
}

export default function RecebimentoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
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

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await getProducts();
    setProducts(data);
    setIsLoading(false);
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
                    placeholder="Escaneie o código da NF"
                    className="w-full bg-[#F1F5F9] border border-transparent rounded-2xl py-3 pl-12 pr-4 text-primary font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
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
                    className="w-full bg-[#F1F5F9] border border-transparent rounded-2xl py-3 pl-12 pr-4 text-primary font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
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
              <div className="relative group">
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
                      <Button type="button" variant="ghost" onClick={() => setSelectedProduct(null)} className="flex-1">Cancelar</Button>
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
    </div>
  );
}
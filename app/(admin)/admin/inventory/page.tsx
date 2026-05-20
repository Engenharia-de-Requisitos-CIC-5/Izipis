'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  X,
  Save,
  Tag,
  Calendar,
  Layers
} from 'lucide-react';
import { getProducts } from '@/services/products';
import { Product } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const productsRef = useRef<Product[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    category: '',
    stock: '',
    minStock: '',
    lote: '',
    validade: ''
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const prods = await getProducts();
        if (!mounted) return;
        productsRef.current = prods;
        setProducts(prods);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const saveProductsToStorage = (updatedProducts: Product[]) => {
    localStorage.setItem('izipis_products', JSON.stringify(updatedProducts));
    productsRef.current = updatedProducts;
    setProducts(updatedProducts);
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        minStock: (product.minStock || 5).toString(),
        lote: product.lote || '',
        validade: product.validade || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', sku: '', price: '', category: 'Geral', stock: '0', minStock: '5', lote: '', validade: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      sku: formData.sku,
      description: editingProduct ? editingProduct.description : '',
      price: parseFloat(formData.price.replace(',', '.')),
      category: formData.category,
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      lote: formData.lote || undefined,
      validade: formData.validade || undefined,
    };

    let newProducts = [...products];
    if (editingProduct) {
      newProducts = newProducts.map(p => p.id === editingProduct.id ? productData : p);
    } else {
      newProducts.push(productData);
    }

    saveProductsToStorage(newProducts);
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto do catálogo?')) {
      const newProducts = products.filter(p => p.id !== id);
      saveProductsToStorage(newProducts);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Gestão de Estoque</h1>
          <p className="text-foreground/60 font-medium">Controle o catálogo, preços e parâmetros para a Inteligência Artificial.</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          className="bg-secondary hover:bg-secondary-dark text-white font-bold gap-2 rounded-xl h-12 px-6"
        >
          <Plus className="w-5 h-5" /> Cadastrar Novo SKU
        </Button>
      </div>

      <Card className="border-primary/5 shadow-sm bg-white overflow-hidden">
        <div className="p-4 border-b border-primary/5 flex gap-4 items-center bg-[#F8FAFC]">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por nome, SKU ou categoria..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-primary/10 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold" 
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="h-10 px-4 rounded-xl border-primary/10 font-bold gap-2 text-primary/60">
              <Package className="w-4 h-4" /> {products.length} Itens Cadastrados
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-primary/5">
                <th className="p-4 pl-6 font-black text-[10px] uppercase tracking-widest text-primary/40">Produto / SKU</th>
                <th className="p-4 font-black text-[10px] uppercase tracking-widest text-primary/40">Rastreabilidade (IA)</th>
                <th className="p-4 font-black text-[10px] uppercase tracking-widest text-primary/40">Preço Base</th>
                <th className="p-4 font-black text-[10px] uppercase tracking-widest text-primary/40 text-center">Estoque Atual</th>
                <th className="p-4 font-black text-[10px] uppercase tracking-widest text-primary/40 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5 text-sm font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-primary/30">Carregando catálogo...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-primary/40 font-bold">Nenhum produto encontrado.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLowStock = product.stock <= (product.minStock || 5);
                  
                  return (
                    <tr key={product.id} className="hover:bg-primary/5 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-primary">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-primary/40 font-bold">SKU: {product.sku}</span>
                          <Badge variant="secondary" className="bg-primary/5 text-primary/60 border-none font-bold text-[9px] px-1.5 py-0">
                            {product.category}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          {product.lote ? (
                            <span className="text-[11px] font-mono text-primary/70 font-bold flex items-center gap-1">
                              <Layers className="w-3 h-3 text-primary/30" /> Lote: {product.lote}
                            </span>
                          ) : (
                            <span className="text-[11px] text-primary/30 italic">Sem lote informado</span>
                          )}
                          {product.validade ? (
                            <span className="text-[11px] font-mono text-amber-600 font-bold flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-500/50" /> Val: {new Date(product.validade).toLocaleDateString('pt-BR')}
                            </span>
                          ) : (
                            <span className="text-[11px] text-primary/30 italic">Sem validade registrada</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-black text-primary">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="p-4 text-center">
                        <Badge className={cn(
                          "font-mono font-black text-[12px] px-3 py-1 border-none",
                          isLowStock ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {product.stock} un
                        </Badge>
                        {isLowStock && (
                          <p className="text-[9px] text-amber-600 font-bold mt-1 uppercase tracking-widest flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Abaixo do Mínimo
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenModal(product)}
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary/40 hover:text-primary transition-colors"
                            title="Editar Produto"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 hover:bg-danger/10 rounded-lg text-primary/40 hover:text-danger transition-colors"
                            title="Excluir Produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Adicionar/Editar Produto */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-primary/5 bg-[#F8FAFC] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                    {editingProduct ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-primary uppercase tracking-tight">
                      {editingProduct ? 'Editar SKU' : 'Novo Produto'}
                    </h2>
                    <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">
                      {editingProduct ? 'Atualize as informações no banco de dados' : 'Cadastre um novo item no catálogo'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-primary/5 rounded-full text-primary/40">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <form id="productForm" onSubmit={handleSaveProduct} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Nome do Produto</label>
                      <input 
                        required 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-[#F8FAFC] border border-primary/10 rounded-xl py-3 px-4 text-primary font-bold focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Código (SKU / Cód. Barras)</label>
                      <input 
                        required 
                        value={formData.sku}
                        onChange={e => setFormData({...formData, sku: e.target.value})}
                        className="w-full bg-[#F8FAFC] border border-primary/10 rounded-xl py-3 px-4 text-primary font-mono font-bold focus:ring-2 focus:ring-secondary/20 outline-none transition-all" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Categoria</label>
                      <input 
                        required 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-[#F8FAFC] border border-primary/10 rounded-xl py-3 px-4 text-primary font-bold focus:ring-2 focus:ring-secondary/20 outline-none transition-all" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Preço de Venda (R$)
                      </label>
                      <input 
                        required 
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        className="w-full bg-[#F8FAFC] border border-primary/10 rounded-xl py-3 px-4 text-primary font-mono font-black focus:ring-2 focus:ring-secondary/20 outline-none transition-all" 
                      />
                    </div>
                  </div>

                  {/* Campos de Lote e Validade Adicionados de volta para Integrar com a IA */}
                  <div className="p-5 bg-secondary/5 border border-secondary/10 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Lote & Validade Atual do Lote
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Lote</label>
                        <input 
                          type="text"
                          placeholder="Ex: LT-2026"
                          value={formData.lote}
                          onChange={e => setFormData({...formData, lote: e.target.value})}
                          className="w-full bg-white border border-primary/10 rounded-xl py-2.5 px-4 text-primary font-mono font-bold focus:ring-2 focus:ring-secondary/20 outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Data de Validade</label>
                        <input 
                          type="date"
                          value={formData.validade}
                          onChange={e => setFormData({...formData, validade: e.target.value})}
                          className="w-full bg-white border border-primary/10 rounded-xl py-2.5 px-4 text-primary font-mono font-bold focus:ring-2 focus:ring-secondary/20 outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                      <Package className="w-4 h-4" /> Parâmetros de Controle Físico
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Estoque Físico Atual</label>
                        <input 
                          required 
                          type="number"
                          value={formData.stock}
                          onChange={e => setFormData({...formData, stock: e.target.value})}
                          className="w-full bg-white border border-primary/10 rounded-xl py-2.5 px-4 text-primary font-mono font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1 text-amber-600">Alerta de Estoque Mínimo</label>
                        <input 
                          required 
                          type="number"
                          value={formData.minStock}
                          onChange={e => setFormData({...formData, minStock: e.target.value})}
                          className="w-full bg-amber-50 border border-amber-200 rounded-xl py-2.5 px-4 text-amber-700 font-mono font-bold focus:ring-2 focus:ring-amber-500/20 outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-primary/5 bg-[#F8FAFC] flex items-center justify-end gap-3 flex-shrink-0">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold text-primary/50">
                  Cancelar
                </Button>
                <Button type="submit" form="productForm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest gap-2 h-12 px-6">
                  <Save className="w-5 h-5" /> Salvar Produto
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
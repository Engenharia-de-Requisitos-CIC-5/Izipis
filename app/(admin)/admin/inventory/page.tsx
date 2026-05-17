'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  AlertCircle,
  X,
  Package,
  Barcode,
  Tag,
  DollarSign,
  Layers,
  FileText,
  Calendar,
  Hash,
  AlertTriangle
} from 'lucide-react';
import { getProducts, addProduct, deleteProduct, updateProduct } from '@/services/products';
import { Product } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Mercearia',
    price: '',
    stock: '',
    minStock: '5',
    lote: '',
    validade: '',
    description: ''
  });

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await getProducts();
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        minStock: (product.minStock || 5).toString(),
        lote: product.lote || '',
        validade: product.validade || '',
        description: product.description
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        category: 'Mercearia',
        price: '',
        stock: '',
        minStock: '5',
        lote: '',
        validade: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      lote: formData.lote || undefined,
      validade: formData.validade || undefined,
      description: formData.description
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productData as Product);
    } else {
      await addProduct(productData as Omit<Product, 'id'>);
    }
    
    setIsModalOpen(false);
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Estoque e Inventário</h1>
          <p className="text-foreground/60 font-medium">Controle total sobre o seu catálogo de produtos.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="px-8 h-14 rounded-2xl gap-2 border-primary/5">
          <Plus className="w-5 h-5" /> 
          Novo Produto
        </Button>
      </div>

      <Card className="overflow-hidden border-primary/5">
        <div className="p-6 border-b border-primary/5 flex flex-col md:flex-row gap-4 items-center bg-[#F8FAFC]">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 w-5 h-5 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, SKU ou categoria..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-white border border-primary/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="secondary" size="sm" className="h-12 px-5 gap-2"><Filter className="w-4 h-4" /> Filtros</Button>
            <Button variant="secondary" size="sm" className="h-12 px-5 gap-2"><ArrowUpDown className="w-4 h-4" /> Ordenar</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-primary/5">
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Produto</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">SKU / Cód.</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Categoria</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Preço</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Estoque</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40">Rastreio (Lote/Val)</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary/40 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {isLoading ? (
                <tr><td colSpan={7} className="p-20 text-center"><div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isCritical = product.stock <= (product.minStock || 0);
                  
                  return (
                    <tr key={product.id} className="hover:bg-primary/5 transition-all group">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-xl font-black text-primary shadow-inner group-hover:bg-secondary group-hover:text-white transition-all">
                            {product.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-primary leading-none mb-1">{product.name}</p>
                            <p className="text-[10px] text-primary/40 font-medium truncate max-w-[150px]">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-xs font-mono font-bold text-primary/60">{product.sku}</td>
                      <td className="p-5">
                        <Badge variant="outline" className="rounded-lg border-primary/10 bg-primary/5 text-[10px] font-black uppercase">{product.category}</Badge>
                      </td>
                      <td className="p-5 font-black text-primary">{formatCurrency(product.price)}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-mono font-bold px-2 py-1 rounded",
                            isCritical ? "bg-danger/10 text-danger" : "bg-secondary/10 text-secondary"
                          )}>
                            {product.stock}
                          </span>
                          {isCritical && (
                            <span title="Estoque Crítico!">
                              <AlertCircle className="w-4 h-4 text-danger animate-pulse" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-1 text-[10px] font-mono">
                          {product.lote ? <span className="text-primary/60">L: {product.lote}</span> : <span className="text-primary/30">L: N/A</span>}
                          {product.validade ? <span className="text-amber-600 font-bold">V: {product.validade}</span> : <span className="text-primary/30">V: N/A</span>}
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button onClick={() => handleOpenModal(product)} variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-secondary hover:text-white"><Edit2 className="w-4 h-4" /></Button>
                          <Button onClick={() => handleDelete(product.id)} variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-danger hover:text-white"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-20 text-center text-primary/20">
                    <Package className="w-16 h-16 mx-auto mb-4 stroke-[1]" />
                    <p className="text-xl font-bold">Nenhum produto localizado</p>
                    <p className="text-sm">Tente ajustar seus filtros de busca.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0D3335]/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-[2.5rem] relative z-10 overflow-y-auto max-h-[90vh] border border-primary/10 custom-scrollbar"
            >
              <div className="p-8 border-b border-primary/5 flex items-center justify-between bg-[#F8FAFC] sticky top-0 z-20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/20">
                    {editingProduct ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-primary uppercase tracking-tight">
                      {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                    </h2>
                    <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">Informações de Inventário</p>
                  </div>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-primary/5 rounded-full transition-all text-primary/40">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Nome do Produto</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20" />
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: Arroz Integral 5kg"
                        className="w-full bg-[#F1F5F9] border border-transparent rounded-2xl py-3 pl-12 pr-4 text-primary font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Código SKU / EAN</label>
                    <div className="relative">
                      <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20" />
                      <input 
                        type="text" 
                        required
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        placeholder="Ex: 78900123"
                        className="w-full bg-[#F1F5F9] border border-transparent rounded-2xl py-3 pl-12 pr-4 text-primary font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Categoria</label>
                    <div className="relative">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20" />
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-[#F1F5F9] border border-transparent rounded-2xl py-3 pl-12 pr-4 text-primary font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none appearance-none"
                      >
                        <option>Mercearia</option>
                        <option>Laticínios</option>
                        <option>Bebidas</option>
                        <option>Limpeza</option>
                        <option>Higiene</option>
                        <option>Hortifruti</option>
                        <option>Padaria</option>
                        <option>Açougue</option>
                        <option>Congelados</option>
                        <option>Pet Shop</option>
                        <option>Bazar</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Preço (R$)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20" />
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="0,00"
                        className="w-full bg-[#F1F5F9] border border-transparent rounded-2xl py-3 pl-12 pr-4 text-primary font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-primary/5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Estoque Atual</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20" />
                      <input 
                        type="number" 
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className="w-full bg-[#F1F5F9] border border-transparent rounded-2xl py-3 pl-12 pr-4 text-primary font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-danger/80 ml-1">Alerta Mínimo</label>
                    <div className="relative">
                      <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-danger/40" />
                      <input 
                        type="number" 
                        required
                        value={formData.minStock}
                        onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                        placeholder="Qtd Crítica"
                        className="w-full bg-danger/5 border border-transparent rounded-2xl py-3 pl-12 pr-4 text-danger font-bold focus:ring-2 focus:ring-danger focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Lote (Opcional)</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20" />
                      <input 
                        type="text"
                        value={formData.lote}
                        onChange={(e) => setFormData({...formData, lote: e.target.value})}
                        placeholder="Ex: LT123"
                        className="w-full bg-[#F1F5F9] border border-transparent rounded-2xl py-3 pl-12 pr-4 text-primary font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Data de Validade (Opcional - Requisito ML)</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20" />
                      <input 
                        type="date"
                        value={formData.validade}
                        onChange={(e) => setFormData({...formData, validade: e.target.value})}
                        className="w-full bg-[#F1F5F9] border border-transparent rounded-2xl py-3 pl-12 pr-4 text-primary font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Descrição Técnica</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-5 h-5 text-primary/20" />
                    <textarea 
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Detalhes adicionais do produto..."
                      className="w-full bg-[#F1F5F9] border border-transparent rounded-2xl py-3 pl-12 pr-4 text-primary font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 h-14 rounded-2xl text-primary uppercase font-black tracking-widest">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-[2] py-4 h-14 rounded-2xl bg-secondary hover:bg-secondary/90 text-white border-none uppercase font-black tracking-[0.2em]">
                    {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary-rgb), 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--primary-rgb), 0.2);
        }
      `}</style>
    </div>
  );
}
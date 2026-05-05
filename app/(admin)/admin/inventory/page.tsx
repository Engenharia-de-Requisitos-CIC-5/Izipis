'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, ArrowUpDown, AlertCircle } from 'lucide-react';
import { getProducts } from '@/services/products';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getProducts();
      setProducts(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">Gerencie os produtos e níveis de estoque do seu mercado.</p>
        </div>
        <Button className="px-6"><Plus className="w-5 h-5" /> Novo Produto</Button>
      </div>

      <Card>
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input type="text" placeholder="Buscar por nome ou SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-secondary border border-border rounded-lg py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary transition-all" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="secondary" size="sm"><Filter className="w-4 h-4" /> Filtros</Button>
            <Button variant="secondary" size="sm"><ArrowUpDown className="w-4 h-4" /> Ordenar</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-border">
                <th className="p-4 font-semibold text-sm">Produto</th>
                <th className="p-4 font-semibold text-sm">SKU</th>
                <th className="p-4 font-semibold text-sm">Categoria</th>
                <th className="p-4 font-semibold text-sm">Preço</th>
                <th className="p-4 font-semibold text-sm">Estoque</th>
                <th className="p-4 font-semibold text-sm">Status</th>
                <th className="p-4 font-semibold text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold text-primary">{product.name[0]}</div>
                        <div><p className="font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{product.description}</p></div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-mono text-muted-foreground">{product.sku}</td>
                    <td className="p-4"><Badge variant="outline">{product.category}</Badge></td>
                    <td className="p-4 font-bold">{formatCurrency(product.price)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={product.stock < 20 ? "text-red-400 font-bold" : "text-foreground"}>{product.stock}</span>
                        {product.stock < 20 && <AlertCircle className="w-4 h-4 text-red-400" />}
                      </div>
                    </td>
                    <td className="p-4"><Badge variant={product.stock > 0 ? 'accent' : 'error'}>{product.stock > 0 ? 'EM ESTOQUE' : 'ESGOTADO'}</Badge></td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhum produto encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

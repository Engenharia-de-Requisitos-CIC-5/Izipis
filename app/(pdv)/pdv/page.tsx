'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, CreditCard, Banknote, QrCode, ShoppingCart, PackageX, CheckCircle2 } from 'lucide-react';
import { getProducts } from '@/services/products';
import { Product } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function PDVPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { cart, addToCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  useEffect(() => {
    async function load() {
      const data = await getProducts();
      setProducts(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setShowSuccess(true);
      clearCart();
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-background">
      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input type="text" placeholder="Buscar produto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-secondary border border-border rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary transition-all text-lg" />
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div> : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} onClick={() => addToCart(product)} className="cursor-pointer hover:border-primary/50 group">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2"><Badge variant="primary">{product.category}</Badge></div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-2xl font-black text-foreground">{formatCurrency(product.price)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50"><PackageX className="w-16 h-16 mb-4" /><p className="text-xl">Nenhum produto encontrado</p></div>}
        </div>
      </div>
      <div className="w-[400px] bg-white border-l border-border flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between"><div className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /><h2 className="font-bold text-xl">Carrinho</h2></div><Badge variant="primary">{totalItems} itens</Badge></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/30">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div key={item.product.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white border border-border p-4 rounded-2xl flex gap-3 items-center shadow-sm">
                <div className="flex-1 min-w-0"><p className="font-bold text-[#0D3335] truncate">{item.product.name}</p><p className="text-sm text-muted-foreground">{formatCurrency(item.product.price)}</p></div>
                <div className="flex items-center gap-2 bg-background rounded-xl p-1.5 border border-border"><button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:text-primary transition-colors"><Minus className="w-4 h-4" /></button><span className="w-8 text-center font-bold text-[#0D3335]">{item.quantity}</span><button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:text-primary transition-colors"><Plus className="w-4 h-4" /></button></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="p-8 bg-[#0D3335] border-t border-white/10 space-y-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-end">
            <span className="text-white/60 font-bold uppercase tracking-widest text-xs">Total a Pagar</span>
            <span className="text-4xl font-black text-white">{formatCurrency(totalPrice)}</span>
          </div>
          <Button className="w-full py-8 text-xl bg-[#E87A5D] hover:bg-[#E87A5D]/90 text-white shadow-2xl shadow-[#E87A5D]/20 border-none" disabled={cart.length === 0} isLoading={isCheckingOut} onClick={handleCheckout}>
            FINALIZAR VENDA
          </Button>
        </div>
      </div>
      <AnimatePresence>{showSuccess && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center text-center space-y-4"><CheckCircle2 className="w-24 h-24 text-accent mx-auto" /><h2 className="text-4xl font-black">Venda Concluída!</h2></motion.div>}</AnimatePresence>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode, 
  ShoppingCart, 
  PackageX, 
  CheckCircle2, 
  Trash2,
  Barcode,
  Keyboard,
  User,
  LogOut,
  Hash
} from 'lucide-react';
import { getProducts } from '@/services/products';
import { Product } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

export default function PDVPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'card' | 'pix'>('card');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { cart, addToCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  useEffect(() => {
    async function load() {
      const data = await getProducts();
      setProducts(data);
      setIsLoading(false);
    }
    load();
    
    // Focus search on mount
    searchInputRef.current?.focus();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleLogout = () => {
    localStorage.removeItem('izipis_user');
    router.push('/login');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F1F5F9] font-sans text-primary">
      {/* PDV Header - Robust & Professional */}
      <header className="h-16 bg-[#0D3335] text-white flex items-center justify-between px-6 shadow-lg z-50">
        <div className="flex items-center gap-6">
          <IZIPISLogo variant="horizontal" color="monochrome-white" />
          <div className="h-6 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2 text-xs font-bold text-white/60">
            <User className="w-3.5 h-3.5" />
            <span>OPERADOR: CAIXA_01</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right mr-4 hidden md:block">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Data/Hora</p>
            <p className="text-xs font-bold">{new Date().toLocaleDateString('pt-BR')} - {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-danger/20 rounded-lg transition-colors text-danger"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar - High Focus */}
          <div className="p-4 bg-white border-b border-primary/5 flex items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 w-5 h-5 group-focus-within:text-secondary transition-colors" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="F1 - Digite o nome ou bipe o código de barras..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-[#F8FAFC] border border-primary/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-base font-medium" 
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd className="bg-white border border-primary/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-primary/40 shadow-sm">F1</kbd>
                <Barcode className="w-5 h-5 text-primary/20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 h-12 px-4 border-primary/10 hover:bg-primary/5">
                <Keyboard className="w-4 h-4" />
                <span className="hidden sm:inline">Teclado</span>
              </Button>
            </div>
          </div>

          {/* Product Browser - Tabular & Efficient */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">Sincronizando Estoque...</p>
                </div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className="bg-white border border-primary/5 rounded-xl p-4 cursor-pointer hover:border-secondary/40 hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-primary/30 uppercase tracking-tighter">{product.sku}</span>
                      <Badge variant="outline" className="text-[9px] py-0 border-primary/10 bg-primary/5">{product.category}</Badge>
                    </div>
                    <h3 className="font-bold text-sm text-primary mb-3 line-clamp-1 group-hover:text-secondary transition-colors">{product.name}</h3>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Preço Unit.</p>
                        <p className="text-xl font-black text-primary">{formatCurrency(product.price)}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                    {/* Stock Indicator */}
                    <div className="absolute bottom-0 left-0 h-1 bg-secondary/10 w-full">
                      <div 
                        className="h-full bg-secondary transition-all" 
                        style={{ width: `${Math.min(100, (product.stock / 100) * 100)}%` }} 
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-primary/20">
                <PackageX className="w-16 h-16 mb-4 stroke-[1]" />
                <p className="text-lg font-bold">Item não localizado</p>
                <p className="text-xs">Verifique o SKU ou tente buscar novamente</p>
              </div>
            )}
          </div>
        </div>

        {/* Checkout Sidebar - Dark & Serious */}
        <div className="w-[450px] bg-white border-l border-primary/10 flex flex-col shadow-2xl relative z-40">
          <div className="p-6 border-b border-primary/5 bg-[#F8FAFC]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-secondary" />
                <h2 className="font-black text-lg uppercase tracking-tight">Cupom Fiscal</h2>
              </div>
              <Badge variant="primary" className="bg-[#0D3335] text-white rounded-md px-3 font-mono">{totalItems.toString().padStart(2, '0')} ITENS</Badge>
            </div>
          </div>

          {/* Cart List - Receipt Style */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#F8FAFC]">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div 
                  key={item.product.id} 
                  layout 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }} 
                  className="bg-white border border-primary/5 p-3 rounded-lg flex gap-3 items-center shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-primary/30 font-mono">{item.product.sku}</p>
                    <p className="font-bold text-sm text-primary truncate leading-tight uppercase">{item.product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-primary/60">{item.quantity} x {formatCurrency(item.product.price)}</span>
                      <span className="text-xs font-black text-secondary">{formatCurrency(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-md p-1 border border-primary/5">
                      <button 
                        onClick={() => updateQuantity(item.product.id, -1)} 
                        className="p-1 hover:bg-white rounded hover:text-danger transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black font-mono">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, 1)} 
                        className="p-1 hover:bg-white rounded hover:text-secondary transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-primary/10 py-20">
                <Hash className="w-12 h-12 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Caixa Disponível</p>
              </div>
            )}
          </div>

          {/* Payment & Totals */}
          <div className="p-6 bg-[#0D3335] text-white">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-white/40 uppercase tracking-[0.2em] text-[10px] font-bold">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-white/40 uppercase tracking-[0.2em] text-[10px] font-bold">
                <span>Desconto</span>
                <span className="font-mono">{formatCurrency(0)}</span>
              </div>
              <div className="h-[1px] bg-white/10" />
              <div className="flex justify-between items-end">
                <span className="text-secondary font-black uppercase tracking-widest text-xs">Total a Pagar</span>
                <span className="text-4xl font-black text-white font-mono leading-none">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {/* Payment Selector */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { id: 'money', label: 'Dinheiro', icon: Banknote },
                { id: 'card', label: 'Cartão', icon: CreditCard },
                { id: 'pix', label: 'PIX', icon: QrCode },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-2 py-3 rounded-lg border transition-all",
                    paymentMethod === method.id 
                      ? "bg-secondary border-secondary text-white shadow-lg shadow-secondary/20" 
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  )}
                >
                  <method.icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">{method.label}</span>
                </button>
              ))}
            </div>

            <Button 
              className="w-full py-7 text-lg bg-secondary hover:bg-secondary/90 text-white shadow-xl shadow-secondary/10 border-none font-black tracking-widest uppercase" 
              disabled={cart.length === 0} 
              isLoading={isCheckingOut} 
              onClick={handleCheckout}
            >
              Finalizar Transação
            </Button>
            
            <div className="mt-4 flex items-center justify-center gap-4 text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
              <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 rounded">INS</kbd> Pagamento</span>
              <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 rounded">DEL</kbd> Cancelar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Overlays */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 z-[100] bg-[#0D3335]/95 backdrop-blur-md flex items-center justify-center text-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl"
            >
              <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-primary mb-2 uppercase tracking-tight">Venda Concluída!</h2>
              <p className="text-primary/60 font-medium mb-8">O cupom fiscal foi enviado para a fila de impressão.</p>
              <div className="space-y-3">
                <Button className="w-full py-6" onClick={() => setShowSuccess(false)}>Próxima Venda (F2)</Button>
                <Button variant="outline" className="w-full py-6 border-primary/10">Imprimir Segunda Via</Button>
              </div>
            </motion.div>
          </motion.div>
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

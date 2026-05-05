'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Barcode, 
  ShoppingCart, 
  PackageX, 
  CheckCircle2, 
  Trash2,
  Keyboard,
  User,
  LogOut,
  Hash,
  Monitor
} from 'lucide-react';
import { getProducts } from '@/services/products';
import { Product } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IZIPISLogo } from '@/components/Logo';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/auth';

export default function PDVPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'card' | 'pix'>('card');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lastItem, setLastItem] = useState<Product | null>(null);
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

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setLastItem(product);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm) {
      const product = products.find(p => p.sku.toLowerCase() === searchTerm.toLowerCase());
      if (product) {
        handleAddToCart(product);
        setSearchTerm('');
      }
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setShowSuccess(true);
      clearCart();
      setLastItem(null);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleLogout = async () => {
    await logout();
  };

  const simulateScan = (sku: string) => {
    const product = products.find(p => p.sku === sku);
    if (product) {
      handleAddToCart(product);
      setIsScannerOpen(false);
    }
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
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Search Bar - High Focus */}
          <div className="p-4 bg-white border-b border-primary/5 flex items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 w-5 h-5 group-focus-within:text-secondary transition-colors" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Aguardando leitura do código de barras..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                onKeyDown={handleKeyDown}
                className="w-full bg-[#F8FAFC] border border-primary/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-base font-medium" 
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd className="bg-white border border-primary/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-primary/40 shadow-sm">ENTER</kbd>
                <Barcode className="w-5 h-5 text-primary/20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsScannerOpen(true)}
                className="gap-2 h-12 px-4 border-primary/10 hover:bg-primary/5 group"
              >
                <Barcode className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Ativar Leitor</span>
              </Button>
            </div>
          </div>

          {/* Central Display Area - High Visibility for Operator */}
          <div className="flex-1 flex items-center justify-center p-12 bg-gradient-to-b from-white to-[#F8FAFC]">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-primary/40 uppercase tracking-[0.2em]">Sincronizando Sistema...</p>
              </div>
            ) : lastItem ? (
              <motion.div 
                key={lastItem.id + Date.now()} // Force animation on same item re-scan
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl"
              >
                <div className="flex flex-col items-center text-center">
                  <Badge className="mb-6 bg-secondary/10 text-secondary border-none px-6 py-2 text-sm font-black uppercase tracking-widest">Item Adicionado</Badge>
                  <h2 className="text-6xl font-black text-primary mb-4 tracking-tighter uppercase leading-tight">{lastItem.name}</h2>
                  <div className="flex items-center gap-6 mb-10">
                    <span className="text-2xl font-mono text-primary/30">{lastItem.sku}</span>
                    <div className="w-2 h-2 rounded-full bg-primary/10" />
                    <span className="text-2xl font-bold text-primary/60 uppercase tracking-widest">{lastItem.category}</span>
                  </div>
                  
                  <div className="bg-[#0D3335] text-white px-12 py-8 rounded-[3rem] shadow-2xl shadow-primary/20 flex flex-col items-center">
                    <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-xs mb-2">Valor Unitário</p>
                    <p className="text-8xl font-black font-mono leading-none">{formatCurrency(lastItem.price)}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center text-center max-w-md">
                <div className="w-32 h-32 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-8">
                  <Monitor className="w-16 h-16 text-primary/10" />
                </div>
                <h2 className="text-3xl font-black text-primary/20 uppercase tracking-tight mb-2">Terminal Pronto</h2>
                <p className="text-primary/40 font-medium">Posicione o código de barras no leitor para iniciar a venda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Checkout Sidebar - Receipt Style */}
        <div className="w-[480px] bg-white border-l border-primary/10 flex flex-col shadow-2xl relative z-40">
          <div className="p-6 border-b border-primary/5 bg-[#F8FAFC]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-secondary" />
                <h2 className="font-black text-lg uppercase tracking-tight">Cupom Fiscal</h2>
              </div>
              <Badge variant="primary" className="bg-[#0D3335] text-white rounded-md px-3 font-mono">{totalItems.toString().padStart(2, '0')} ITENS</Badge>
            </div>
          </div>

          {/* Cart List */}
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
                <p className="text-xs font-bold uppercase tracking-widest">Aguardando Itens</p>
              </div>
            )}
          </div>

          {/* Totals & Payment */}
          <div className="p-8 bg-[#0D3335] text-white">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-white/40 uppercase tracking-[0.2em] text-[10px] font-bold">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="h-[1px] bg-white/10" />
              <div className="flex justify-between items-end">
                <span className="text-secondary font-black uppercase tracking-widest text-xs">Total</span>
                <span className="text-5xl font-black text-white font-mono leading-none">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-8">
              {[
                { id: 'money', label: 'Dinheiro', icon: Banknote },
                { id: 'card', label: 'Cartão', icon: CreditCard },
                { id: 'pix', label: 'PIX', icon: Hash },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-2 py-4 rounded-xl border transition-all",
                    paymentMethod === method.id 
                      ? "bg-secondary border-secondary text-white shadow-lg shadow-secondary/20" 
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  )}
                >
                  <method.icon className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{method.label}</span>
                </button>
              ))}
            </div>

            <Button 
              className="w-full py-8 text-xl bg-secondary hover:bg-secondary/90 text-white shadow-2xl shadow-secondary/20 border-none font-black tracking-[0.1em] uppercase" 
              disabled={cart.length === 0} 
              isLoading={isCheckingOut} 
              onClick={handleCheckout}
            >
              Concluir Venda (F2)
            </Button>
            
            <div className="mt-6 flex items-center justify-center gap-4 text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">
              <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1 rounded">INS</kbd> Pagamento</span>
              <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1 rounded">DEL</kbd> Cancelar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 z-[100] bg-[#0D3335]/95 backdrop-blur-md flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 bg-[#F8FAFC] border-b border-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Barcode className="w-6 h-6 text-secondary" />
                  <h2 className="text-xl font-black text-primary uppercase tracking-tight">Leitor Integrado</h2>
                </div>
                <Button variant="ghost" onClick={() => setIsScannerOpen(false)}>Fechar</Button>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-square bg-black rounded-2xl relative overflow-hidden flex items-center justify-center border-4 border-secondary/20">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <Barcode className="w-32 h-32 text-white/10" />
                    <div className="absolute inset-x-0 top-1/2 h-1 bg-secondary shadow-[0_0_15px_rgba(var(--secondary-rgb),0.5)] animate-scan" />
                    <div className="absolute inset-0 border-[40px] border-black/40" />
                  </div>
                  <p className="text-center text-xs font-bold text-primary/40 uppercase tracking-widest">Aponte o código para a lente do leitor</p>
                </div>

                <div className="flex flex-col">
                  <h3 className="font-bold text-primary mb-4">Produtos Próximos:</h3>
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
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
                        <Barcode className="w-4 h-4 text-primary/20 group-hover:text-secondary" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

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
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
        .animate-scan {
          position: absolute;
          width: 100%;
          height: 2px;
          background: #E87A5D;
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

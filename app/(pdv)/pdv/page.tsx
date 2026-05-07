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
import { createSale } from '@/services/sales';
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

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      await createSale({
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        total: totalPrice,
        paymentMethod: paymentMethod,
        source: 'LOCAL'
      });

      setIsCheckingOut(false);
      setShowSuccess(true);
      clearCart();
      setLastItem(null);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      setIsCheckingOut(false);
    }
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
    <div className="h-screen flex flex-col overflow-hidden bg-background font-sans">
      <header className="h-12 bg-primary text-white flex items-center justify-between px-6 border-b border-white/10 z-50">
        <div className="flex items-center gap-4">
          <IZIPISLogo variant="horizontal" color="monochrome-white" className="h-6" />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center gap-4 text-[10px] font-bold text-white/70">
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3" />
              <span>CAIXA: 01</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Monitor className="w-3 h-3" />
              <span>LOJA: PEDRINHO 2</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{new Date().toLocaleDateString('pt-BR')} | {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 hover:bg-danger/20 rounded transition-colors text-white/60 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
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
                className="w-full bg-background border border-primary/10 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-light/20 focus:border-primary-light transition-all text-sm font-medium" 
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd className="bg-white border border-primary/10 px-1 py-0.5 rounded text-[9px] font-bold text-primary/40">ENTER</kbd>
                <Barcode className="w-4 h-4 text-primary/20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsScannerOpen(true)}
                className="gap-2 h-10 px-4 border-primary/10 hover:bg-primary/5 group"
              >
                <Barcode className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Ativar Leitor</span>
              </Button>
            </div>
          </div>

          {/* Central Display Area - High Visibility for Operator */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-background overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em]">Sincronizando Sistema...</p>
              </div>
            ) : lastItem ? (
              <motion.div 
                key={lastItem.id + Date.now()} 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl"
              >
                <div className="bg-white border-2 border-primary/5 rounded-2xl p-10 flex flex-col items-center text-center">
                  <Badge className="mb-4 bg-secondary/10 text-secondary border-none px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em]">Último Item Registrado</Badge>
                  <h2 className="text-4xl md:text-5xl font-black text-primary mb-2 tracking-tighter uppercase leading-tight">{lastItem.name}</h2>
                  <div className="flex items-center gap-3 mb-8">
                    <span className="text-lg font-mono text-primary/40 tracking-wider">SKU: {lastItem.sku}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/10" />
                    <span className="text-lg font-bold text-primary/60 uppercase tracking-widest">{lastItem.category}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 w-full">
                    <div className="bg-primary-light/5 border border-primary-light/10 p-6 rounded-2xl">
                      <p className="text-primary-light font-bold uppercase tracking-widest text-[9px] mb-1">Preço Unitário</p>
                      <p className="text-4xl font-black font-mono text-primary">{formatCurrency(lastItem.price)}</p>
                    </div>
                    <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl">
                      <p className="text-primary/60 font-bold uppercase tracking-widest text-[9px] mb-1">Total Item</p>
                      <p className="text-4xl font-black font-mono text-primary">{formatCurrency(lastItem.price)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center text-center max-w-md">
                <div className="w-24 h-24 bg-white rounded-3xl border-2 border-primary/5 flex items-center justify-center mb-6">
                  <Barcode className="w-10 h-10 text-primary/10" />
                </div>
                <h2 className="text-xl font-black text-primary/20 uppercase tracking-widest mb-2">Aguardando Operação</h2>
                <p className="text-primary/30 text-sm font-medium">Escaneie um produto ou utilize a busca manual para iniciar o cupom.</p>
              </div>
            )}
          </div>
        </div>

        {/* Checkout Sidebar - Receipt Style */}
        <div className="w-full lg:w-[340px] bg-white border-t lg:border-t-0 lg:border-l border-primary/10 flex flex-col relative z-40 max-h-[50vh] lg:max-h-none overflow-hidden">
          <div className="p-4 border-b border-dashed border-primary/20 bg-white text-center">
            <h1 className="font-black text-sm uppercase tracking-[0.3em] mb-1">PEDRINHO 2</h1>
            <p className="text-[8px] font-bold text-primary/60 leading-tight uppercase">Rua Maria do Socorro e Silva Bezerra 159<br/>Jardim Nova Cidade</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[9px] font-black text-primary/20 uppercase tracking-widest">NFC-e: 000452</span>
              <span className="text-[9px] font-black text-primary/20 uppercase tracking-widest">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <div className="px-4 py-2 bg-primary/5 flex justify-between items-center text-[9px] font-black text-primary/70 uppercase tracking-widest">
            <span className="flex-1">Descrição</span>
            <span className="w-12 text-center">Qtd</span>
            <span className="w-16 text-right">Total</span>
          </div>

          {/* Cart List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {cart.map((item, idx) => (
                <motion.div 
                  key={item.product.id} 
                  layout 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[11px] text-primary truncate uppercase leading-tight mb-0.5">{item.product.name}</p>
                      <p className="text-[9px] font-mono text-primary/30">{item.product.sku}</p>
                    </div>
                    <div className="w-12 text-center text-[11px] font-mono font-bold text-primary/60">
                      {item.quantity}
                    </div>
                    <div className="w-16 text-right text-[11px] font-mono font-black text-primary">
                      {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                  <div className="mt-2 border-b border-dashed border-primary/5" />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-primary/5 py-20">
                <ShoppingCart className="w-12 h-12 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Caixa Livre</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-primary-dark text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="space-y-2 relative z-10">
              <div className="flex justify-between items-center text-white/50 uppercase tracking-[0.2em] text-[9px] font-bold">
                <span>Itens: {totalItems.toString().padStart(2, '0')}</span>
                <span className="font-mono">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-white/30 font-black uppercase tracking-[0.2em] text-[10px]">Total Cupom</span>
                <span className="text-4xl font-black text-white font-mono leading-none tabular-nums">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Action Area - 60% White Background with 10% Red Button */}
          <div className="p-6 bg-white border-t border-primary/10">
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { id: 'money', label: 'DIN', icon: Banknote, key: 'F3' },
                { id: 'card', label: 'CART', icon: CreditCard, key: 'F4' },
                { id: 'pix', label: 'PIX', icon: Hash, key: 'F5' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-all relative overflow-hidden",
                    paymentMethod === method.id 
                      ? "bg-primary border-primary text-white scale-[1.02]" 
                      : "bg-white border-primary/10 text-primary/40 hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  <method.icon className={cn("w-4 h-4", paymentMethod === method.id ? "text-white" : "text-primary/20")} />
                  <span className="text-[9px] font-black tracking-widest">{method.label}</span>
                  <span className="absolute top-1 right-1 text-[7px] font-black text-primary/20">{method.key}</span>
                </button>
              ))}
            </div>

            <Button 
              className="w-full py-5 text-sm bg-secondary hover:bg-secondary-dark text-white border-none font-black tracking-[0.2em] uppercase transition-transform active:scale-95" 
              disabled={cart.length === 0} 
              isLoading={isCheckingOut} 
              onClick={handleCheckout}
            >
              Finalizar Venda (F2)
            </Button>
          </div>
        </div>
      </div>

      {/* PDV Shortcuts Footer - Real Terminal Feel */}
      <footer className="h-10 bg-white border-t border-primary/10 flex items-center px-4 overflow-x-auto no-scrollbar gap-6">
        {[
          { key: 'F1', label: 'Pesquisar' },
          { key: 'F2', label: 'Finalizar' },
          { key: 'F3', label: 'Dinheiro' },
          { key: 'F4', label: 'Cartão' },
          { key: 'F5', label: 'PIX' },
          { key: 'F8', label: 'Quantidade' },
          { key: 'F9', label: 'Limpar' },
          { key: 'DEL', label: 'Remover Item' },
          { key: 'ESC', label: 'Sair' },
        ].map((item) => (
          <div key={item.key} className="flex items-center gap-2 whitespace-nowrap">
            <kbd className="bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded text-[10px] font-black text-primary/60">{item.key}</kbd>
            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </footer>

      {/* Overlays */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 z-[100] bg-primary/95 backdrop-blur-md flex items-center justify-center p-8"
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
            className="absolute inset-0 z-[100] bg-primary/95 backdrop-blur-md flex items-center justify-center text-center p-8"
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

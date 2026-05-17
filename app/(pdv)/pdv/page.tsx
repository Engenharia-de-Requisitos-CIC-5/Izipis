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
  Monitor,
  ShoppingBag,
  AlertTriangle,
  FileText,
  Wifi,
  WifiOff
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

interface IFoodOrder {
  id: string;
  customer: string;
  items: { name: string; quantity: number; price: number; sku: string }[];
  total: number;
  status: 'PENDING' | 'PREPARING' | 'READY';
}

export default function PDVPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'card' | 'pix'>('money');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lastItem, setLastItem] = useState<Product | null>(null);
  
  // Novos estados para atender aos requisitos
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [logs, setLogs] = useState<string[]>(['[SISTEMA] PDV inicializado com sucesso.']);
  const [ifoodOrders, setIfoodOrders] = useState<IFoodOrder[]>([
    {
      id: 'iFood-#1024',
      customer: 'Carlos Silva',
      items: [
        { name: 'Arroz Integral 1kg', quantity: 2, price: 7.50, sku: '78910001' },
        { name: 'Leite Integral 1L', quantity: 3, price: 5.40, sku: '78910003' }
      ],
      total: 31.20,
      status: 'PENDING'
    }
  ]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { cart, addToCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [`[${time}] ${message}`, ...prev]);
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await getProducts();
        setProducts(data);
        addLog('Produtos sincronizados com sucesso.');
      } catch (error) {
        addLog('Erro ao carregar produtos. Verifique a conexão.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
    searchInputRef.current?.focus();
  }, []);

  // Atalhos de teclado globais
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
        addLog('Atalho F1: Campo de busca focado.');
      }
      if (e.key === 'F2') {
        e.preventDefault();
        if (cart.length > 0 && !isCheckingOut) {
          handleCheckout();
        }
      }
      if (e.key === 'F3') { e.preventDefault(); setPaymentMethod('money'); }
      if (e.key === 'F4') { e.preventDefault(); setPaymentMethod('card'); }
      if (e.key === 'F5') { e.preventDefault(); setPaymentMethod('pix'); }
      if (e.key === 'F8') {
        e.preventDefault();
        if (selectedCartItemId) {
          const item = cart.find(i => i.product.id === selectedCartItemId);
          if (item) {
            const qtyStr = prompt(`Nova quantidade para ${item.product.name}:`, item.quantity.toString());
            const qty = parseInt(qtyStr || '', 10);
            if (!isNaN(qty) && qty >= 0) {
              updateQuantity(selectedCartItemId, qty - item.quantity);
              addLog(`Quantidade de ${item.product.name} alterada para ${qty}.`);
            }
          }
        } else {
          alert('Selecione um item no carrinho primeiro.');
        }
      }
      if (e.key === 'Delete') {
        if (selectedCartItemId) {
          const item = cart.find(i => i.product.id === selectedCartItemId);
          if (item) {
            updateQuantity(selectedCartItemId, -item.quantity);
            addLog(`Item ${item.product.name} removido do carrinho.`);
            setSelectedCartItemId(null);
          }
        }
      }
      if (e.key === 'Escape') {
        if (showSuccess) setShowSuccess(false);
        if (isScannerOpen) setIsScannerOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [cart, selectedCartItemId, paymentMethod, isCheckingOut, showSuccess, isScannerOpen]);

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      addLog(`AVISO: Tentativa de adicionar ${product.name} sem estoque.`);
      // Dependendo da regra de negócio, pode bloquear ou apenas avisar
    }
    if (product.stock > 0 && product.stock <= (product.minStock || 0)) {
      addLog(`ALERTA: Estoque crítico atingido para ${product.name} (${product.stock} un).`);
    }

    addToCart(product);
    setLastItem(product);
    setSelectedCartItemId(product.id);
    addLog(`Adicionado: ${product.name} (SKU: ${product.sku})`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm) {
      const product = products.find(p => p.sku.toLowerCase() === searchTerm.toLowerCase() || p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (product) {
        handleAddToCart(product);
        setSearchTerm('');
      } else {
        addLog(`Produto não encontrado para o termo: ${searchTerm}`);
      }
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      if (!isOffline) {
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
      } else {
        addLog('Venda salva em cache local (Modo Offline).');
      }

      setIsCheckingOut(false);
      setShowSuccess(true);
      addLog(`Venda finalizada: R$ ${totalPrice.toFixed(2)} via ${paymentMethod.toUpperCase()}`);
      clearCart();
      setLastItem(null);
      setSelectedCartItemId(null);
    } catch (error) {
      addLog('Erro ao finalizar venda.');
      setIsCheckingOut(false);
    }
  };

  const handleProcessIfoodOrder = (orderId: string) => {
    const order = ifoodOrders.find(o => o.id === orderId);
    if (!order) return;

    if (order.status === 'PENDING') {
      setIfoodOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'PREPARING' } : o));
      addLog(`iFood: Pedido ${orderId} aceito e em preparo.`);
    } else if (order.status === 'PREPARING') {
      setIfoodOrders(prev => prev.filter(o => o.id !== orderId));
      addLog(`iFood: Pedido ${orderId} finalizado. Estoque atualizado.`);
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
          <button 
            onClick={() => {
              setIsOffline(!isOffline);
              addLog(`Conexão alterada para: ${!isOffline ? 'OFFLINE' : 'ONLINE'}`);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase transition-colors border",
              isOffline ? "bg-amber-500/20 text-amber-500 border-amber-500/50" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
            )}
          >
            {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
            {isOffline ? 'Offline' : 'Online'}
          </button>
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
                placeholder="Aguardando leitura do código de barras ou nome do produto (F1)..." 
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
          <div className="flex-1 flex flex-col p-4 md:p-8 bg-background overflow-hidden relative">
            
            <div className="flex-1 flex items-center justify-center min-h-0">
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
                      {lastItem.validade && (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/10" />
                          <span className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" /> VAL: {lastItem.validade}
                          </span>
                        </>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 w-full">
                      <div className="bg-primary-light/5 border border-primary-light/10 p-6 rounded-2xl">
                        <p className="text-primary-light font-bold uppercase tracking-widest text-[9px] mb-1">Preço Unitário</p>
                        <p className="text-4xl font-black font-mono text-primary">{formatCurrency(lastItem.price)}</p>
                      </div>
                      <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl">
                        <p className="text-primary/60 font-bold uppercase tracking-widest text-[9px] mb-1">Total Item</p>
                        <p className="text-4xl font-black font-mono text-primary">
                          {formatCurrency(lastItem.price * (cart.find(i => i.product.id === lastItem.id)?.quantity || 1))}
                        </p>
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

            {/* Painel Inferior: Integração iFood e Logs */}
            <div className="h-48 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
              {/* Fila iFood */}
              <div className="bg-white rounded-xl border border-primary/10 overflow-hidden flex flex-col">
                <div className="bg-rose-50 border-b border-rose-100 p-2 flex items-center justify-between">
                  <span className="text-rose-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <ShoppingBag className="w-3 h-3" /> Integração iFood (API)
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                  {ifoodOrders.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[10px] text-primary/30 font-medium uppercase tracking-wider">
                      Fila Digital Vazia
                    </div>
                  ) : (
                    ifoodOrders.map(order => (
                      <div key={order.id} className="bg-background border border-primary/5 rounded-lg p-2 mb-2 text-xs flex justify-between items-center">
                        <div>
                          <div className="font-bold text-primary flex items-center gap-2">
                            {order.id} 
                            <Badge className={cn("text-[8px] px-1 py-0 border-none", order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-[10px] text-primary/50 font-mono mt-1">{order.items.length} itens • {formatCurrency(order.total)}</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className={cn("h-7 text-[10px]", order.status === 'PENDING' ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50')}
                          onClick={() => handleProcessIfoodOrder(order.id)}
                        >
                          {order.status === 'PENDING' ? 'Aceitar' : 'Concluir'}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Logs e Auditoria */}
              <div className="bg-[#1e293b] rounded-xl overflow-hidden flex flex-col text-slate-300">
                <div className="bg-slate-900 p-2 flex items-center gap-2 border-b border-slate-700">
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Auditoria & Logs</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar font-mono text-[9px] space-y-1">
                  {logs.map((log, idx) => (
                    <div key={idx} className={cn("truncate", log.includes('ERRO') ? 'text-rose-400' : log.includes('ALERTA') ? 'text-amber-400' : 'text-slate-300')}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>

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
                  onClick={() => setSelectedCartItemId(item.product.id)}
                  className={cn(
                    "relative cursor-pointer p-2 rounded-lg border transition-colors",
                    selectedCartItemId === item.product.id ? "bg-primary/5 border-primary/20" : "border-transparent hover:bg-background"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[11px] text-primary truncate uppercase leading-tight mb-0.5">{item.product.name}</p>
                      <div className="flex flex-col gap-0.5 text-[9px] font-mono text-primary/40">
                        <span>{item.product.sku}</span>
                        {item.product.validade && <span className="text-amber-500">VAL: {item.product.validade}</span>}
                      </div>
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

          <div className="p-6 bg-primary-dark text-white relative overflow-hidden flex-shrink-0">
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

          {/* Action Area */}
          <div className="p-6 bg-white border-t border-primary/10 flex-shrink-0">
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
              className="w-full py-5 text-sm bg-secondary hover:bg-secondary-dark text-white border-none font-black tracking-[0.2em] uppercase transition-transform active:scale-95 flex items-center justify-center gap-2" 
              disabled={cart.length === 0} 
              isLoading={isCheckingOut} 
              onClick={handleCheckout}
            >
              Finalizar Venda <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">F2</span>
            </Button>
          </div>
        </div>
      </div>

      {/* PDV Shortcuts Footer - Real Terminal Feel */}
      <footer className="h-10 bg-white border-t border-primary/10 flex items-center px-4 overflow-x-auto no-scrollbar gap-6 flex-shrink-0">
        {[
          { key: 'F1', label: 'Pesquisar' },
          { key: 'F2', label: 'Finalizar' },
          { key: 'F3', label: 'Dinheiro' },
          { key: 'F4', label: 'Cartão' },
          { key: 'F5', label: 'PIX' },
          { key: 'F8', label: 'Quantidade' },
          { key: 'DEL', label: 'Remover Item' },
          { key: 'ESC', label: 'Sair/Fechar' },
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
              className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-[#F8FAFC] border-b border-primary/5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Barcode className="w-6 h-6 text-secondary" />
                  <h2 className="text-xl font-black text-primary uppercase tracking-tight">Leitor Integrado</h2>
                </div>
                <Button variant="ghost" onClick={() => setIsScannerOpen(false)}>Fechar (ESC)</Button>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden">
                <div className="space-y-4">
                  <div className="aspect-square bg-black rounded-2xl relative overflow-hidden flex items-center justify-center border-4 border-secondary/20">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <Barcode className="w-32 h-32 text-white/10" />
                    <div className="absolute inset-x-0 top-1/2 h-1 bg-secondary shadow-[0_0_15px_rgba(var(--secondary-rgb),0.5)] animate-scan" />
                    <div className="absolute inset-0 border-[40px] border-black/40" />
                  </div>
                  <p className="text-center text-xs font-bold text-primary/40 uppercase tracking-widest">Aponte o código para a lente do leitor</p>
                </div>

                <div className="flex flex-col min-h-0">
                  <h3 className="font-bold text-primary mb-4">Seleção Rápida (Simulação):</h3>
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
                          <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
                          {product.stock <= (product.minStock || 0) && (
                            <Badge className="bg-amber-100 text-amber-700 text-[8px] py-0 px-1 border-none">
                              Estoque Baixo
                            </Badge>
                          )}
                        </div>
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
                <Button className="w-full py-6 font-bold" onClick={() => setShowSuccess(false)}>Próxima Venda (ESC / F2)</Button>
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
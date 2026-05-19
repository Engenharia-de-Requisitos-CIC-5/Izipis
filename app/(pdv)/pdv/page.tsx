'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  CreditCard, 
  Banknote, 
  Barcode, 
  ShoppingCart, 
  CheckCircle2, 
  User,
  LogOut,
  Hash,
  Monitor,
  ShoppingBag,
  AlertTriangle,
  FileText,
  Wifi,
  WifiOff,
  Printer,
  Lock,
  Unlock,
  Wallet,
  Plus,
  Minus,
  Trash2,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft
} from 'lucide-react';
import { getProducts } from '@/services/products';
import { createSale, getSales } from '@/services/sales';
import { Product, Sale } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
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

interface DrawerMovement {
  type: 'sangria' | 'suprimento';
  amount: number;
  reason: string;
  time: string;
}

export default function PDVPage() {
  const router = useRouter();
  
  // =========================================================================
  // ESTADOS DO SISTEMA
  // =========================================================================
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [initialCashInput, setInitialCashInput] = useState('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'card' | 'pix'>('money');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lastItem, setLastItem] = useState<Product | null>(null);
  
  const [lastSaleDetails, setLastSaleDetails] = useState<any>(null);
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [logs, setLogs] = useState<string[]>(['[SISTEMA] Aguardando abertura do caixa...']);
  
  // Estados do Fechamento de Caixa e Sangria/Suprimento
  const [showCloseRegister, setShowCloseRegister] = useState(false);
  const [registerStats, setRegisterStats] = useState({ total: 0, money: 0, card: 0, pix: 0, count: 0, initialCash: 0 });
  const [drawerMovements, setDrawerMovements] = useState<DrawerMovement[]>([]);
  
  const [showDrawerModal, setShowDrawerModal] = useState(false);
  const [drawerForm, setDrawerForm] = useState<{type: 'sangria'|'suprimento', amount: string, reason: string}>({
    type: 'sangria', amount: '', reason: ''
  });

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
        addLog('Produtos sincronizados. Base pronta.');
      } catch (error) {
        addLog('Erro ao carregar produtos. Verifique a conexão.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (isRegisterOpen && !showDrawerModal && !showCloseRegister) {
      searchInputRef.current?.focus();
    }
  }, [isRegisterOpen, showDrawerModal, showCloseRegister]);

  // =========================================================================
  // ATALHOS DE TECLADO GLOBAIS
  // =========================================================================
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isRegisterOpen) return;

      if (e.key === 'F1') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'F2') { e.preventDefault(); if (cart.length > 0 && !isCheckingOut) handleCheckout(); }
      if (e.key === 'F3') { e.preventDefault(); setPaymentMethod('money'); }
      if (e.key === 'F4') { e.preventDefault(); setPaymentMethod('card'); }
      if (e.key === 'F5') { e.preventDefault(); setPaymentMethod('pix'); }
      
      if (e.key === 'F7') {
        e.preventDefault();
        setShowDrawerModal(true);
      }

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
        }
      }

      if (e.key === 'F9') {
        e.preventDefault();
        handleOpenCloseRegister();
      }

      if (e.key === 'Delete') {
        if (selectedCartItemId) {
          const item = cart.find(i => i.product.id === selectedCartItemId);
          if (item) {
            updateQuantity(selectedCartItemId, -item.quantity);
            addLog(`Item removido: ${item.product.name}`);
            setSelectedCartItemId(null);
          }
        }
      }

      if (e.key === 'Escape') {
        if (showSuccess) setShowSuccess(false);
        if (isScannerOpen) setIsScannerOpen(false);
        if (showCloseRegister) setShowCloseRegister(false);
        if (showDrawerModal) setShowDrawerModal(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isRegisterOpen, cart, selectedCartItemId, paymentMethod, isCheckingOut, showSuccess, isScannerOpen, showCloseRegister, showDrawerModal]);

  // =========================================================================
  // FUNÇÕES CORE DO PDV E MOVIMENTAÇÃO DE GAVETA
  // =========================================================================
  const handleOpenRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(initialCashInput.replace(',', '.')) || 0;
    
    setRegisterStats(prev => ({ ...prev, initialCash: amount }));
    setIsRegisterOpen(true);
    addLog(`CAIXA ABERTO. Fundo de troco registrado: R$ ${amount.toFixed(2)}`);
  };

  const handleDrawerMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(drawerForm.amount.replace(',', '.')) || 0;
    if (amount <= 0) return alert('Insira um valor válido maior que zero.');

    const movement: DrawerMovement = {
      type: drawerForm.type,
      amount: amount,
      reason: drawerForm.reason || 'Não informada',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setDrawerMovements(prev => [...prev, movement]);
    setShowDrawerModal(false);
    setDrawerForm({ type: 'sangria', amount: '', reason: '' });
    
    addLog(`GAVETA: ${movement.type === 'sangria' ? 'Sangria (Saída)' : 'Suprimento (Entrada)'} de R$ ${amount.toFixed(2)} - Motivo: ${movement.reason}`);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setLastItem(product);
    setSelectedCartItemId(product.id);
    addLog(`Adicionado: ${product.name}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm) {
      const product = products.find(p => p.sku.toLowerCase() === searchTerm.toLowerCase() || p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (product) {
        handleAddToCart(product);
        setSearchTerm('');
      } else {
        addLog(`Produto não encontrado: ${searchTerm}`);
      }
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      if (!isOffline) {
        const saleItems = cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }));

        await createSale({
          items: saleItems,
          total: totalPrice,
          paymentMethod: paymentMethod,
          source: 'LOCAL'
        });

        setLastSaleDetails({
          items: saleItems,
          total: totalPrice,
          paymentMethod: paymentMethod,
          date: new Date().toLocaleString('pt-BR')
        });

        const updatedProducts = await getProducts();
        setProducts(updatedProducts);
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

  const handleProcessIfoodOrder = async (orderId: string) => {
    const order = ifoodOrders.find(o => o.id === orderId);
    if (!order) return;

    if (order.status === 'PENDING') {
      setIfoodOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'PREPARING' } : o));
      addLog(`iFood: Pedido ${orderId} aceito e em preparo.`);
    } else if (order.status === 'PREPARING') {
      try {
        const saleItems = order.items.map(ifoodItem => {
          const realProduct = products.find(p => p.sku === ifoodItem.sku);
          return {
            productId: realProduct ? realProduct.id : `ifood_mock_${ifoodItem.sku}`,
            name: ifoodItem.name,
            quantity: ifoodItem.quantity,
            price: ifoodItem.price
          };
        });

        await createSale({
          items: saleItems,
          total: order.total,
          paymentMethod: 'pix',
          source: 'IFOOD'
        });

        setIfoodOrders(prev => prev.filter(o => o.id !== orderId));
        const updatedProducts = await getProducts();
        setProducts(updatedProducts);
        addLog(`iFood: Pedido ${orderId} finalizado. Estoque e Faturamento Atualizados!`);
      } catch (error) {
        addLog(`Erro ao registrar venda iFood no sistema.`);
      }
    }
  };

  // =========================================================================
  // FECHAMENTO DE CAIXA (CÁLCULO MATEMÁTICO AVANÇADO)
  // =========================================================================
  const handleOpenCloseRegister = async () => {
    const allSales = await getSales();
    const todayStr = new Date().toLocaleDateString('pt-BR');
    
    const todayLocalSales = allSales.filter(s => 
      new Date(s.timestamp).toLocaleDateString('pt-BR') === todayStr && s.source === 'LOCAL'
    );

    let money = 0, card = 0, pix = 0, total = 0;
    
    todayLocalSales.forEach(s => {
      total += s.total;
      if (s.paymentMethod === 'money') money += s.total;
      if (s.paymentMethod === 'card') card += s.total;
      if (s.paymentMethod === 'pix') pix += s.total;
    });

    setRegisterStats(prev => ({ ...prev, total, money, card, pix, count: todayLocalSales.length }));
    setShowCloseRegister(true);
    addLog('Auditoria de Caixa (Redução Z) solicitada.');
  };

  const getTotalSangria = () => drawerMovements.filter(m => m.type === 'sangria').reduce((acc, m) => acc + m.amount, 0);
  const getTotalSuprimento = () => drawerMovements.filter(m => m.type === 'suprimento').reduce((acc, m) => acc + m.amount, 0);

  const printZReport = () => {
    const tSangria = getTotalSangria();
    const tSuprimento = getTotalSuprimento();
    const totalInDrawer = registerStats.initialCash + registerStats.money + tSuprimento - tSangria;

    const reportContent = `
      <html>
      <head>
        <title>Redução Z - Fechamento de Caixa</title>
        <style>
          @page { margin: 0; }
          body { font-family: 'Courier New', Courier, monospace; font-size: 12px; width: 300px; margin: 0 auto; padding: 15px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
          .flex-between { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .title { font-size: 16px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="center bold title">MERCADINHO PEDRINHO 2</div>
        <div class="center">RELATÓRIO GERENCIAL - REDUÇÃO Z</div>
        <div class="center">Data: ${new Date().toLocaleString('pt-BR')}</div>
        <div class="center">Operador: CAIXA 01</div>
        
        <div class="divider"></div>
        <div class="center bold" style="margin-bottom: 10px;">RESUMO DE VENDAS</div>
        
        <div class="flex-between">
          <span>Total de Vendas (Qtd):</span>
          <span>${registerStats.count}</span>
        </div>
        <div class="divider"></div>
        
        <div class="flex-between">
          <span>Dinheiro (Espécie):</span>
          <span>R$ ${registerStats.money.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="flex-between">
          <span>Cartão (Crédito/Débito):</span>
          <span>R$ ${registerStats.card.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="flex-between">
          <span>Transferência PIX:</span>
          <span>R$ ${registerStats.pix.toFixed(2).replace('.', ',')}</span>
        </div>
        
        <div class="divider"></div>
        <div class="flex-between bold" style="font-size: 14px;">
          <span>TOTAL VENDIDO:</span>
          <span>R$ ${registerStats.total.toFixed(2).replace('.', ',')}</span>
        </div>

        <div class="divider"></div>
        <div class="center bold" style="margin-bottom: 10px;">FLUXO DE GAVETA (ESPÉCIE)</div>
        
        <div class="flex-between">
          <span>Fundo de Caixa (Abertura):</span>
          <span>R$ ${registerStats.initialCash.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="flex-between">
          <span>Vendas em Dinheiro (+):</span>
          <span>R$ ${registerStats.money.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="flex-between">
          <span>Suprimentos/Entradas (+):</span>
          <span>R$ ${tSuprimento.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="flex-between">
          <span>Sangrias/Saídas (-):</span>
          <span>R$ ${tSangria.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="divider"></div>
        <div class="flex-between bold" style="font-size: 14px;">
          <span>TOTAL NA GAVETA:</span>
          <span>R$ ${totalInDrawer.toFixed(2).replace('.', ',')}</span>
        </div>

        ${drawerMovements.length > 0 ? `
          <div class="divider"></div>
          <div class="center bold" style="margin-bottom: 10px;">DETALHAMENTO DE MOVIMENTOS</div>
          ${drawerMovements.map(m => `
            <div style="margin-bottom: 5px;">
              <div class="flex-between">
                <span>${m.time} - ${m.type === 'sangria' ? 'SANGRIA' : 'SUPRIMENTO'}</span>
                <span>R$ ${m.amount.toFixed(2).replace('.', ',')}</span>
              </div>
              <div style="font-size: 10px; color: #555;">Motivo: ${m.reason}</div>
            </div>
          `).join('')}
        ` : ''}

        <div class="divider"></div>
        <div class="center" style="margin-top: 30px;">
          _______________________________<br/>
          Assinatura do Operador
        </div>
        <div class="center" style="margin-top: 20px;">FIM DO RELATÓRIO</div>
        
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(reportContent);
      printWindow.document.close();
      setShowCloseRegister(false);
      addLog('Relatório de Redução Z impresso com sucesso.');
    }
  };

  const printReceipt = () => {
    if (!lastSaleDetails) return;
    const paymentMap: Record<string, string> = { money: 'Dinheiro', card: 'Cartão', pix: 'PIX' };
    const methodStr = paymentMap[lastSaleDetails.paymentMethod] || 'Desconhecido';

    const receiptContent = `
      <html>
      <head>
        <title>Cupom Fiscal</title>
        <style>
          @page { margin: 0; }
          body { font-family: 'Courier New', Courier, monospace; font-size: 12px; width: 300px; margin: 0 auto; padding: 15px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
          .flex-between { display: flex; justify-content: space-between; }
          .item-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .item-name { width: 50%; }
          .item-qty { width: 20%; text-align: center; }
          .item-price { width: 30%; text-align: right; }
          .total-section { font-size: 16px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 16px; margin-bottom: 5px;">MERCADINHO PEDRINHO 2</div>
        <div class="center">Rua Maria do Socorro, 159</div>
        <div class="center">CNPJ: 00.000.000/0001-00</div>
        <div class="center">Data: ${lastSaleDetails.date}</div>
        
        <div class="divider"></div>
        <div class="center bold">CUPOM NÃO FISCAL</div>
        <div class="divider"></div>

        <div class="flex-between bold" style="margin-bottom: 10px;">
          <div class="item-name">ITEM</div>
          <div class="item-qty">QTD</div>
          <div class="item-price">VL TOTAL</div>
        </div>

        ${lastSaleDetails.items.map((item: any) => `
          <div class="item-row">
            <div class="item-name">${item.name}</div>
            <div class="item-qty">${item.quantity}</div>
            <div class="item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
          </div>
        `).join('')}

        <div class="divider"></div>
        
        <div class="flex-between total-section bold">
          <div>TOTAL</div>
          <div>R$ ${lastSaleDetails.total.toFixed(2).replace('.', ',')}</div>
        </div>
        
        <div class="flex-between" style="margin-top: 5px;">
          <div>FORMA PAGTO</div>
          <div>${methodStr}</div>
        </div>

        <div class="divider"></div>
        <div class="center" style="margin-top: 20px;">
          *** OBRIGADO PELA PREFERÊNCIA ***<br/>
          Volte Sempre!
        </div>
        
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
    }
  };

  const simulateScan = (sku: string) => {
    const product = products.find(p => p.sku === sku);
    if (product) {
      handleAddToCart(product);
      setIsScannerOpen(false);
    }
  };

  // =========================================================================
  // RENDERIZAÇÃO
  // =========================================================================
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background font-sans relative">
      
      {/* TELA DE ABERTURA DE CAIXA (SOBREPÕE TUDO) */}
      <AnimatePresence>
        {!isRegisterOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute inset-0 z-[200] bg-primary flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
            
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-10 max-w-md w-full shadow-2xl relative z-10 flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 border border-secondary/20">
                <Wallet className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-black text-primary uppercase tracking-tighter mb-2">Abertura de Caixa</h1>
              <p className="text-primary/50 text-sm font-medium mb-8 text-center">Informe o Fundo de Troco atual da gaveta para iniciar as operações do dia.</p>
              
              <form onSubmit={handleOpenRegisterSubmit} className="w-full space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Valor em Gaveta (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 font-black">R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      required
                      autoFocus
                      placeholder="0,00"
                      value={initialCashInput}
                      onChange={(e) => setInitialCashInput(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-primary/10 rounded-2xl py-4 pl-12 pr-4 text-2xl text-primary font-black focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full py-6 h-14 bg-secondary hover:bg-secondary-dark text-white font-black uppercase tracking-widest gap-2 text-sm rounded-xl">
                  <Unlock className="w-5 h-5" /> Iniciar Turno
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            onClick={() => logout()}
            className="p-1.5 hover:bg-danger/20 rounded transition-colors text-white/60 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Search Bar */}
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

          {/* Central Display Area */}
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
                  <div className="w-24 h-24 bg-white rounded-xl border-2 border-primary/5 flex items-center justify-center mb-6">
                    <Barcode className="w-10 h-10 text-primary/10" />
                  </div>
                  <h2 className="text-xl font-black text-primary/20 uppercase tracking-widest mb-2">Aguardando Operação</h2>
                  <p className="text-primary/30 text-sm font-medium">Escaneie um produto ou utilize a busca manual para iniciar o cupom.</p>
                </div>
              )}
            </div>

            {/* Painel Inferior: Integração iFood e Logs */}
            <div className="h-48 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
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

        {/* Checkout Sidebar */}
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
            <span className="w-20 text-center">Ações / Qtd</span>
          </div>

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
                    
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 bg-white border border-primary/10 rounded-md p-0.5 shadow-sm">
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, -1); }} 
                          className="p-1 hover:bg-primary/5 rounded text-primary/60 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        
                        <span className="text-[11px] font-mono font-bold w-4 text-center text-primary">{item.quantity}</span>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, 1); }} 
                          className="p-1 hover:bg-primary/5 rounded text-primary/60 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        
                        <div className="w-px h-3 bg-primary/10 mx-0.5" />
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, -item.quantity); }} 
                          className="p-1 hover:bg-danger/10 text-danger rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="text-[11px] font-mono font-black text-primary mt-1">
                        {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                      </div>
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

      {/* PDV Shortcuts Footer */}
      <footer className="h-10 bg-white border-t border-primary/10 flex items-center px-4 overflow-x-auto no-scrollbar gap-6 flex-shrink-0">
        {[
          { key: 'F1', label: 'Pesquisar' },
          { key: 'F2', label: 'Finalizar' },
          { key: 'F7', label: 'Sangria/Supri' },
          { key: 'F8', label: 'Quantidade' },
          { key: 'F9', label: 'Fechar Caixa' },
          { key: 'DEL', label: 'Remover Item' },
        ].map((item) => (
          <div 
            key={item.key} 
            className="flex items-center gap-2 whitespace-nowrap cursor-pointer hover:opacity-80"
            onClick={() => {
              if (item.key === 'F9') handleOpenCloseRegister();
              if (item.key === 'F7') setShowDrawerModal(true);
            }}
          >
            <kbd className="bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded text-[10px] font-black text-primary/60">{item.key}</kbd>
            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </footer>

      {/* Overlays */}
      <AnimatePresence>
        
        {/* MODAL DE SANGRIA / SUPRIMENTO (NOVO F7) */}
        {showDrawerModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 z-[110] bg-primary/95 backdrop-blur-md flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 bg-[#F8FAFC] border-b border-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-primary uppercase tracking-tight">Fluxo de Gaveta</h2>
                    <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">Sangria (Saída) ou Suprimento (Entrada)</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setShowDrawerModal(false)}>ESC</Button>
              </div>
              
              <div className="p-8">
                <form onSubmit={handleDrawerMovementSubmit} className="space-y-6">
                  
                  {/* Seleção do Tipo */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDrawerForm({...drawerForm, type: 'sangria'})}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                        drawerForm.type === 'sangria' ? "border-danger bg-danger/5 text-danger" : "border-primary/10 text-primary/40 hover:border-primary/30"
                      )}
                    >
                      <TrendingDown className="w-8 h-8" />
                      <span className="font-black uppercase tracking-widest text-xs">Sangria (Retirar)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerForm({...drawerForm, type: 'suprimento'})}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                        drawerForm.type === 'suprimento' ? "border-emerald-500 bg-emerald-500/5 text-emerald-600" : "border-primary/10 text-primary/40 hover:border-primary/30"
                      )}
                    >
                      <TrendingUp className="w-8 h-8" />
                      <span className="font-black uppercase tracking-widest text-xs">Suprimento (Pôr)</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Valor (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 font-black">R$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0.01"
                        required
                        autoFocus
                        value={drawerForm.amount}
                        onChange={(e) => setDrawerForm({...drawerForm, amount: e.target.value})}
                        className="w-full bg-[#F8FAFC] border border-primary/10 rounded-2xl py-4 pl-12 pr-4 text-2xl text-primary font-black focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Motivo / Observação</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Troco para entregador, Compra de água..."
                      value={drawerForm.reason}
                      onChange={(e) => setDrawerForm({...drawerForm, reason: e.target.value})}
                      className="w-full bg-[#F8FAFC] border border-primary/10 rounded-xl py-3 px-4 text-primary font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                    />
                  </div>

                  <Button type="submit" className="w-full py-6 h-14 bg-secondary hover:bg-secondary-dark text-white font-black uppercase tracking-widest gap-2 text-sm rounded-xl">
                    <CheckCircle2 className="w-5 h-5" /> Registrar Movimentação
                  </Button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* OUTROS MODAIS (Leitor, Sucesso, Redução Z) */}
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
              className="max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
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
              className="max-w-md w-full bg-white rounded-2xl p-10 shadow-2xl"
            >
              <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-primary mb-2 uppercase tracking-tight">Venda Concluída!</h2>
              <p className="text-primary/60 font-medium mb-8">O cupom fiscal foi enviado para a fila de impressão.</p>
              <div className="space-y-3">
                <Button className="w-full py-6 font-bold" onClick={() => setShowSuccess(false)}>Próxima Venda (ESC / F2)</Button>
                <Button variant="outline" className="w-full py-6 border-primary/10 gap-2 flex items-center justify-center" onClick={printReceipt}>
                  <Printer className="w-5 h-5" /> Imprimir Cupom Fiscal
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCloseRegister && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 z-[100] bg-primary/95 backdrop-blur-md flex items-center justify-center text-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-primary p-8 text-white relative">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-widest mb-1">Redução Z</h2>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Fechamento de Caixa • {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
              
              <div className="p-8 bg-[#F8FAFC]">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2 border-b border-primary/5">
                    <span className="text-primary/60 font-bold text-xs uppercase tracking-widest">Fundo (Abertura)</span>
                    <span className="text-primary font-black font-mono">{formatCurrency(registerStats.initialCash)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-primary/5">
                    <span className="text-primary/60 font-bold text-xs uppercase tracking-widest">Dinheiro (Vendas)</span>
                    <span className="text-primary font-black font-mono">+ {formatCurrency(registerStats.money)}</span>
                  </div>
                  
                  {/* NOVOS DADOS DA REDUÇÃO Z */}
                  <div className="flex justify-between items-center py-2 border-b border-primary/5">
                    <span className="text-emerald-600/80 font-bold text-xs uppercase tracking-widest">Suprimento (Entrada)</span>
                    <span className="text-emerald-600 font-black font-mono">+ {formatCurrency(getTotalSuprimento())}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-primary/5">
                    <span className="text-danger/80 font-bold text-xs uppercase tracking-widest">Sangria (Retirada)</span>
                    <span className="text-danger font-black font-mono">- {formatCurrency(getTotalSangria())}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 bg-primary/5 px-4 rounded-xl mt-4">
                    <span className="text-primary font-black uppercase tracking-widest">Total na Gaveta</span>
                    <span className="text-primary font-black font-mono text-xl">
                      {formatCurrency(registerStats.initialCash + registerStats.money + getTotalSuprimento() - getTotalSangria())}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full py-6 font-bold bg-danger hover:bg-danger/90 text-white gap-2 uppercase tracking-widest" 
                    onClick={printZReport}
                  >
                    <Printer className="w-5 h-5" /> Imprimir e Fechar
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full py-6 text-primary/40 font-bold hover:bg-primary/5" 
                    onClick={() => setShowCloseRegister(false)}
                  >
                    Cancelar
                  </Button>
                </div>
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
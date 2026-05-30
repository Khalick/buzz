'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProductGrid from '@/components/pos/ProductGrid';
import Cart, { CartItem } from '@/components/pos/Cart';
import CheckoutModal from '@/components/pos/CheckoutModal';
import ProductManager, { POSProduct } from '@/components/pos/ProductManager';
import CategoryManager, { POSCategory } from '@/components/pos/CategoryManager';
import SalesHistory from '@/components/pos/SalesHistory';
import SalesAnalytics from '@/components/pos/SalesAnalytics';
import ReceiptPreview from '@/components/pos/ReceiptPreview';
import KeyboardShortcuts from '@/components/pos/KeyboardShortcuts';
import { syncProductsDown, initSyncListeners, getLocalCategories, initDB } from '@/lib/posOfflineSync';
import { Clock, DownloadCloud, History, LayoutDashboard, Package, Tag as TagIcon, Settings, Keyboard, PlayCircle, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import InstallPrompt from '@/components/pwa/InstallPrompt';

type Panel = 'cart' | 'history' | 'analytics' | 'products' | 'categories';

interface HeldOrder {
  id: string;
  label: string;
  items: CartItem[];
  discount: { type: 'none' | 'percent' | 'fixed'; value: number };
  customerName: string;
  customerPhone: string;
  orderNotes: string;
  createdAt: number;
}

export default function POSPage() {
  // Core State
  const [businessId, setBusinessId] = useState<string>('');
  const [cashierId, setCashierId] = useState<string>('');
  const [cashierName, setCashierName] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('BizHub POS');
  const [businessPhone, setBusinessPhone] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [time, setTime] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // UI State
  const [activePanel, setActivePanel] = useState<Panel>('cart');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Order State
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<{ type: 'none' | 'percent' | 'fixed'; value: number }>({ type: 'none', value: 0 });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);

  // Data State
  const [categories, setCategories] = useState<POSCategory[]>([]);
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in a standard input (except body)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
      
      if (e.key === 'F1') { e.preventDefault(); /* Focus search handled in ProductGrid */ }
      if (e.key === 'F2') { e.preventDefault(); if (items.length > 0) setShowCheckout(true); }
      if (e.key === 'F3') { e.preventDefault(); if (items.length > 0) handleHoldOrder(); }
      if (e.key === 'F4') { e.preventDefault(); setActivePanel('history'); }
      if (e.key === 'F5') { e.preventDefault(); setActivePanel('products'); }
      if (e.key === 'F6') { e.preventDefault(); setActivePanel('analytics'); }
      if (e.key === 'F7') { e.preventDefault(); setActivePanel('categories'); }
      if (e.key === 'F8') { e.preventDefault(); clearCart(); }
      if (e.key === 'Escape') {
        setShowCheckout(false);
        setReceiptData(null);
        setShowShortcuts(false);
      }
      if (e.key === '?' && !isInput && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        setShowShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, showCheckout, receiptData, showShortcuts]); // Dependencies for actions

  // Initial Load
  useEffect(() => {
    initSyncListeners();
    
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    }, 1000);

    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCashierId(user.id);
        // We'd ideally fetch their profile for name
        const { data: biz } = await supabase.from('businesses').select('id, name, contact').or(`owner_id.eq.${user.id},submitted_by.eq.${user.id}`).limit(1).maybeSingle();
        if (biz) {
          setBusinessId(biz.id);
          setBusinessName(biz.name);
          setBusinessPhone(biz.contact?.phone || '');
          await handleForceSync(biz.id);
          await loadOrders(biz.id);
        } else {
          setBusinessName('Setup Required');
        }
      }

      // Load held orders from local storage
      const saved = localStorage.getItem('pos_held_orders');
      if (saved) {
        try { setHeldOrders(JSON.parse(saved)); } catch (e) {}
      }
    }
    loadData();

    return () => clearInterval(t);
  }, []);

  // Sync and Data Fetching
  const handleForceSync = async (id: string = businessId) => {
    if (!id || !navigator.onLine) return;
    setIsSyncing(true);
    await syncProductsDown(id);
    await loadLocalData();
    setIsSyncing(false);
    setRefreshKey(k => k + 1);
  };

  const loadLocalData = async () => {
    const db = await initDB();
    if (!db) return;
    const cats = await db.getAll('categories');
    const prods = await db.getAll('products');
    setCategories(cats.sort((a,b) => a.sort_order - b.sort_order));
    setProducts(prods);
  };

  const loadOrders = async (bizId: string) => {
    // In a real app, we'd also pull from IDB syncQueue to show pending orders,
    // but for now we fetch completed from Supabase.
    if (!navigator.onLine) return;
    const { data: orders } = await supabase
      .from('pos_orders')
      .select('*, items:pos_order_items(*)')
      .eq('business_id', bizId)
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (orders) setPastOrders(orders);
  };

  // Cart Operations
  const handleAddToCart = (product: any) => {
    setItems(prev => {
      const existing = prev.find(i => i.pos_product_id === product.id);
      if (existing) {
        return prev.map(i => i.pos_product_id === product.id 
          ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * i.unit_price }
          : i
        );
      }
      return [{
        pos_product_id: product.id,
        name: product.name,
        quantity: 1,
        unit_price: Number(product.price),
        total_price: Number(product.price)
      }, ...prev]; // Add to top
    });
    if (activePanel !== 'cart') setActivePanel('cart');
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => 
      prev.map(i => {
        if (i.pos_product_id === id) {
          const newQ = Math.max(0, i.quantity + delta);
          return { ...i, quantity: newQ, total_price: newQ * i.unit_price };
        }
        return i;
      }).filter(i => i.quantity > 0)
    );
  };

  const clearCart = () => {
    setItems([]);
    setDiscount({ type: 'none', value: 0 });
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
  };

  // Held Orders Logic
  const handleHoldOrder = () => {
    if (items.length === 0) return;
    const newHeld: HeldOrder = {
      id: Date.now().toString(),
      label: customerName || `Order #${heldOrders.length + 1}`,
      items,
      discount,
      customerName,
      customerPhone,
      orderNotes,
      createdAt: Date.now()
    };
    const updated = [...heldOrders, newHeld];
    setHeldOrders(updated);
    localStorage.setItem('pos_held_orders', JSON.stringify(updated));
    clearCart();
  };

  const restoreHeldOrder = (id: string) => {
    const order = heldOrders.find(o => o.id === id);
    if (!order) return;
    
    // If current cart has items, we should hold it first or ask to clear, 
    // but for simplicity, we'll just overwrite (or you could append).
    // Let's replace:
    setItems(order.items);
    setDiscount(order.discount);
    setCustomerName(order.customerName);
    setCustomerPhone(order.customerPhone);
    setOrderNotes(order.orderNotes);
    
    const updated = heldOrders.filter(o => o.id !== id);
    setHeldOrders(updated);
    localStorage.setItem('pos_held_orders', JSON.stringify(updated));
  };

  // CRUD Operations (Direct to Supabase, then sync down)
  const saveCategory = async (cat: Omit<POSCategory, 'id'>) => {
    if (!businessId) return alert('Error: No business associated with your account. Please set up a business first.');
    if (!navigator.onLine) return alert('Error: You are currently offline. Sync not possible.');
    const { error } = await supabase.from('pos_categories').insert({ ...cat, business_id: businessId });
    if (!error) handleForceSync();
    else alert('Error saving category: ' + error.message);
  };
  
  const updateCategory = async (id: string, data: Partial<POSCategory>) => {
    if (!navigator.onLine) return alert('Error: You are currently offline.');
    const { error } = await supabase.from('pos_categories').update(data).eq('id', id);
    if (!error) handleForceSync();
    else alert('Error updating category: ' + error.message);
  };

  const deleteCategory = async (id: string) => {
    if (!navigator.onLine) return alert('Error: You are currently offline.');
    const { error } = await supabase.from('pos_categories').delete().eq('id', id);
    if (!error) handleForceSync();
    else alert('Error deleting category: ' + error.message);
  };

  const saveProduct = async (product: Partial<POSProduct>) => {
    if (!businessId) return alert('Error: No business associated with your account.');
    if (!navigator.onLine) return alert('Error: You are currently offline.');
    const { error } = await supabase.from('pos_products').insert({ ...product, business_id: businessId });
    if (!error) handleForceSync();
    else alert('Error saving product: ' + error.message);
  };

  const updateProduct = async (id: string, data: Partial<POSProduct>) => {
    if (!navigator.onLine) return alert('Error: You are currently offline.');
    const { error } = await supabase.from('pos_products').update(data).eq('id', id);
    if (!error) handleForceSync();
    else alert('Error updating product: ' + error.message);
  };

  const deleteProduct = async (id: string) => {
    if (!navigator.onLine) return alert('Error: You are currently offline.');
    const { error } = await supabase.from('pos_products').delete().eq('id', id);
    if (!error) handleForceSync();
    else alert('Error deleting product: ' + error.message);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const discountAmount = discount.type === 'percent'
    ? subtotal * (discount.value / 100)
    : discount.type === 'fixed' ? discount.value : 0;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = afterDiscount * 0.16;
  const total = afterDiscount + tax;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 font-sans">
      
      {/* POS Top Header */}
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
         <div className="flex items-center gap-4">
           <div className="h-10 w-10 bg-gradient-to-br from-[#0D1F16] to-[#1B4332] rounded-xl flex items-center justify-center text-[#D4AF37] font-black text-xl shadow-md border border-[#D4AF37]/20">
             B
           </div>
           <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400 hidden sm:block">
             BizHub POS (v5 Update)
           </h1>
         </div>
         
         {/* Center: Held Orders / Status */}
         <div className="flex items-center gap-2 overflow-x-auto max-w-lg scrollbar-hide px-4">
           {heldOrders.map((ho) => (
             <button key={ho.id} onClick={() => restoreHeldOrder(ho.id)}
               className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-amber-200 transition-colors flex items-center gap-1 border border-amber-200 dark:border-amber-800">
               <PlayCircle size={12} /> {ho.label} ({ho.items.length})
             </button>
           ))}
         </div>

         <div className="flex items-center gap-4">
            <Link
              href="/dashboard/credit-health"
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#D4AF37]/15 to-[#D4AF37]/5 text-[#856404] hover:from-[#D4AF37]/25 border border-[#D4AF37]/40 rounded-lg text-sm font-semibold transition-all"
              title="Credit Health Dashboard"
            >
              <Wallet size={16} />
              <span className="hidden sm:inline">Credit</span>
            </Link>
            <button onClick={() => setShowShortcuts(true)} className="p-2 text-gray-400 hover:text-[#2D6A4F] bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors" title="Keyboard Shortcuts (?)">
              <Keyboard size={18} />
            </button>
           <button 
             onClick={() => handleForceSync()} 
             disabled={isSyncing}
             className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
           >
             <DownloadCloud size={16} className={isSyncing ? "animate-bounce" : ""} />
             <span className="hidden sm:inline">Sync</span>
           </button>
           <div className="hidden md:flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium text-sm">
             <Clock size={16} />
             {time}
           </div>
         </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Product Grid Area */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6 relative">
          <ProductGrid onAddToCart={handleAddToCart} categories={categories} refreshKey={refreshKey} />
        </div>

        {/* Right: Multi-Panel Area */}
        <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 flex flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 transition-transform transform">
          
          {/* Panel Navigation Tabs */}
          <div className="flex p-2 gap-1 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide shrink-0">
            {[
              { id: 'cart', icon: <ShoppingCart size={16} />, label: 'Cart' },
              { id: 'history', icon: <History size={16} />, label: 'History' },
              { id: 'analytics', icon: <LayoutDashboard size={16} />, label: 'Data' },
              { id: 'products', icon: <Package size={16} />, label: 'Products' },
              { id: 'categories', icon: <TagIcon size={16} />, label: 'Categories' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActivePanel(tab.id as Panel)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  activePanel === tab.id ? 'bg-[#1B4332] text-[#D4AF37] shadow-sm' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}>
                {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activePanel === 'cart' && (
              <Cart 
                items={items} 
                onUpdateQuantity={updateQuantity}
                onRemove={(id) => updateQuantity(id, -1000)}
                onClear={clearCart}
                onCheckout={() => setShowCheckout(true)}
                onHoldOrder={handleHoldOrder}
                heldCount={heldOrders.length}
                discount={discount}
                onDiscountChange={setDiscount}
                customerName={customerName}
                customerPhone={customerPhone}
                onCustomerChange={(n, p) => { setCustomerName(n); setCustomerPhone(p); }}
                orderNotes={orderNotes}
                onNotesChange={setOrderNotes}
              />
            )}
            
            {activePanel === 'history' && (
              <SalesHistory 
                orders={pastOrders} 
                onViewReceipt={(order) => setReceiptData({
                   receiptNumber: order.receipt_number,
                   businessName,
                   businessPhone,
                   cashierName,
                   items: order.items || [],
                   subtotal: order.subtotal,
                   discountAmount: order.discount_amount,
                   discountType: order.discount_type,
                   taxAmount: order.tax_amount,
                   total: order.total_amount,
                   paymentMethod: order.payment_method,
                   customerName: order.customer_name,
                   customerPhone: order.customer_phone,
                   notes: order.notes,
                   createdAt: order.created_at
                })} 
                isLoading={false} 
              />
            )}

            {activePanel === 'analytics' && (
              <SalesAnalytics orders={pastOrders} />
            )}

            {activePanel === 'products' && (
              <ProductManager 
                products={products} 
                categories={categories}
                onSave={saveProduct}
                onUpdate={updateProduct}
                onDelete={deleteProduct}
                onClose={() => setActivePanel('cart')}
              />
            )}

            {activePanel === 'categories' && (
              <CategoryManager 
                categories={categories}
                onSave={saveCategory}
                onUpdate={updateCategory}
                onDelete={deleteCategory}
                onClose={() => setActivePanel('cart')}
              />
            )}
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)} 
        subtotal={subtotal}
        discountAmount={discountAmount}
        discountType={discount.type}
        taxAmount={tax}
        total={total}
        items={items}
        businessId={businessId}
        customerName={customerName}
        customerPhone={customerPhone}
        orderNotes={orderNotes}
        onComplete={(receipt) => {
          clearCart();
          setReceiptData({ ...receipt, businessName, businessPhone, cashierName });
          // Optional: refresh history after a short delay to see new order
          setTimeout(() => loadOrders(businessId), 2000);
        }}
      />

      <ReceiptPreview 
        isOpen={!!receiptData}
        receipt={receiptData}
        onClose={() => setReceiptData(null)}
      />

      <KeyboardShortcuts 
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      <InstallPrompt />
    </div>
  );
}

// Missing ShoppingCart icon import above
function ShoppingCart({ size, className }: { size: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
}

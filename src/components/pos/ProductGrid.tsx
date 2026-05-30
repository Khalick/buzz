'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getLocalProducts } from '@/lib/posOfflineSync';
import { Search, WifiOff, Box, Volume2 } from 'lucide-react';
import type { POSCategory } from './CategoryManager';

interface ProductGridProps {
  onAddToCart: (product: any) => void;
  categories: POSCategory[];
  refreshKey?: number;
}

export default function ProductGrid({ onAddToCart, categories, refreshKey }: ProductGridProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [scanBuffer, setScanBuffer] = useState('');
  const [lastKeyTime, setLastKeyTime] = useState(0);
  const [scanFlash, setScanFlash] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    async function load() {
      const data = await getLocalProducts();
      setProducts(data || []);
    }
    load();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshKey]);

  // Beep sound for successful scan
  const playBeep = useCallback((success: boolean) => {
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = success ? 1200 : 400;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + (success ? 0.1 : 0.3));
    } catch {}
  }, []);

  // Barcode scanner detection (keyboard wedge mode)
  // Scanners type much faster than humans (< 50ms between chars) and end with Enter
  useEffect(() => {
    let buffer = '';
    let lastTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is in a modal or typing in an input other than our search
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && target !== searchRef.current) return;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      const now = Date.now();
      const timeDiff = now - lastTime;
      lastTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 3 && timeDiff < 100) {
          // This is a barcode scan!
          e.preventDefault();
          const barcode = buffer;
          buffer = '';
          
          const product = products.find(p => p.barcode === barcode || p.sku === barcode);
          if (product) {
            onAddToCart(product);
            playBeep(true);
            setScanFlash(true);
            setTimeout(() => setScanFlash(false), 300);
          } else {
            playBeep(false);
            setSearch(barcode);
            if (searchRef.current) searchRef.current.focus();
          }
        } else {
          buffer = '';
        }
        return;
      }

      // Build buffer for fast sequential input
      if (timeDiff > 100) {
        buffer = ''; // Reset if too slow (human typing)
      }
      if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, onAddToCart, playBeep]);

  // Filtering
  const filtered = products.filter(p => {
    const matchSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search)) ||
      (p.sku && p.sku?.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = activeCategory === 'all' || p.category_id === activeCategory;
    const isActive = p.is_active !== false;
    return matchSearch && matchCategory && isActive;
  });

  const getCategoryColor = (catId?: string) => categories.find(c => c.id === catId)?.color || '#0A1D37';

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search bar with scan indicator */}
      <div className={`relative transition-all duration-200 ${scanFlash ? 'ring-2 ring-[#A51C30] rounded-2xl' : ''}`}>
        <input
          ref={searchRef}
          type="text"
          placeholder="Scan barcode or search products..."
          className="w-full p-4 pl-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 outline-none text-lg transition-shadow focus:ring-2 focus:ring-[#B39A74] focus:border-transparent"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

        {isOffline && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold animate-pulse">
            <WifiOff size={14} /> Offline
          </div>
        )}
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
              activeCategory === 'all'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
            }`}
          >
            All ({products.filter(p => p.is_active !== false).length})
          </button>
          {categories.map(cat => {
            const count = products.filter(p => p.category_id === cat.id && p.is_active !== false).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
                }`}
                style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto pb-4 pr-1">
        {products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <Box size={64} className="opacity-20" />
            <p className="text-xl">Catalog is empty</p>
            <p className="text-sm">Add products or sync your catalog.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
            <Search size={40} className="opacity-20" />
            <p className="text-sm">No products match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(p => {
              const outOfStock = p.stock_quantity <= 0;
              const lowStock = p.stock_quantity > 0 && p.stock_quantity <= 5;
              return (
                <button
                  key={p.id}
                  onClick={() => !outOfStock && onAddToCart(p)}
                  disabled={outOfStock}
                  className={`group flex flex-col items-center justify-center p-5 rounded-2xl shadow-sm transition-all border border-transparent relative ${
                    outOfStock
                      ? 'bg-gray-100 dark:bg-gray-800/30 opacity-60 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 hover:shadow-xl active:scale-95 hover:border-[#B39A74]/50'
                  }`}
                >
                  {/* Low stock badge */}
                  {lowStock && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold">
                      Low
                    </div>
                  )}
                  {outOfStock && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full text-[10px] font-bold">
                      Out
                    </div>
                  )}
                  
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-3 transform group-hover:scale-110 transition-transform shadow-inner"
                    style={{ background: `linear-gradient(135deg, ${getCategoryColor(p.category_id)}, ${getCategoryColor(p.category_id)}dd)` }}
                  >
                    {p.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-100 text-center line-clamp-2 w-full text-sm">{p.name}</span>
                  <span className="font-black mt-1.5 text-sm" style={{ color: getCategoryColor(p.category_id) }}>
                    KES {p.price?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    {outOfStock ? 'Out of stock' : `${p.stock_quantity} in stock`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

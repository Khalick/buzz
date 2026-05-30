'use client';

import { useState } from 'react';
import { Minus, Plus, Trash2, Percent, DollarSign, Tag, User, MessageSquare, PauseCircle } from 'lucide-react';

export interface CartItem {
  pos_product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  note?: string;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  onHoldOrder: () => void;
  heldCount: number;
  discount: { type: 'none' | 'percent' | 'fixed'; value: number };
  onDiscountChange: (discount: { type: 'none' | 'percent' | 'fixed'; value: number }) => void;
  customerName: string;
  customerPhone: string;
  onCustomerChange: (name: string, phone: string) => void;
  orderNotes: string;
  onNotesChange: (notes: string) => void;
}

export default function Cart({
  items, onUpdateQuantity, onRemove, onClear, onCheckout, onHoldOrder, heldCount,
  discount, onDiscountChange, customerName, customerPhone, onCustomerChange,
  orderNotes, onNotesChange,
}: CartProps) {
  const [showDiscount, setShowDiscount] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [discountInput, setDiscountInput] = useState(String(discount.value || ''));

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const discountAmount = discount.type === 'percent'
    ? subtotal * (discount.value / 100)
    : discount.type === 'fixed' ? discount.value : 0;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = afterDiscount * 0.16;
  const total = afterDiscount + tax;

  const applyDiscount = (type: 'none' | 'percent' | 'fixed') => {
    if (type === 'none') {
      onDiscountChange({ type: 'none', value: 0 });
      setDiscountInput('');
    } else {
      onDiscountChange({ type, value: Number(discountInput) || 0 });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h2 className="text-lg font-bold bg-gradient-to-r from-[#0A1D37] to-[#1B3A5C] bg-clip-text text-transparent drop-shadow-sm">
          Current Order
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={onHoldOrder} disabled={items.length === 0} title="Hold Order (F3)"
            className="relative p-1.5 hover:bg-[#B39A74]/15 dark:hover:bg-[#B39A74]/25 text-[#B39A74] rounded-lg transition-colors disabled:opacity-30">
            <PauseCircle size={18} />
            {heldCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B39A74] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{heldCount}</span>
            )}
          </button>
          <button onClick={onClear} disabled={items.length === 0} className="text-[#A51C30] hover:text-[#8B1728] text-xs font-medium transition-colors disabled:opacity-30">Clear</button>
        </div>
      </div>

      {/* Quick action pills */}
      <div className="flex gap-1.5 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => setShowDiscount(!showDiscount)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
            discount.type !== 'none' ? 'bg-[#0A1D37]/10 dark:bg-[#0A1D37]/30 text-[#0A1D37] dark:text-[#B39A74]' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
          }`}>
          <Percent size={10} /> {discount.type !== 'none' ? 'Discount ✓' : 'Discount'}
        </button>
        <button onClick={() => setShowCustomer(!showCustomer)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
            customerName ? 'bg-[#0A1D37]/10 dark:bg-[#0A1D37]/30 text-[#0A1D37] dark:text-[#B39A74]' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
          }`}>
          <User size={10} /> {customerName || 'Customer'}
        </button>
        <button onClick={() => setShowNotes(!showNotes)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
            orderNotes ? 'bg-[#B39A74]/15 dark:bg-[#B39A74]/30 text-[#B39A74] dark:text-[#B39A74]' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
          }`}>
          <MessageSquare size={10} /> {orderNotes ? 'Note ✓' : 'Note'}
        </button>
      </div>

      {/* Discount panel */}
      {showDiscount && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-[#0A1D37]/5 dark:bg-[#0A1D37]/10 animate-fade-in space-y-2">
          <div className="flex gap-2">
            <input type="number" value={discountInput} onChange={e => setDiscountInput(e.target.value)} placeholder="Amount"
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm outline-none border border-gray-200 dark:border-gray-700" />
            <button onClick={() => applyDiscount('percent')} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${discount.type === 'percent' ? 'bg-[#0A1D37] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>%</button>
            <button onClick={() => applyDiscount('fixed')} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${discount.type === 'fixed' ? 'bg-[#0A1D37] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>KES</button>
            {discount.type !== 'none' && (
              <button onClick={() => applyDiscount('none')} className="px-2 py-2 text-[#A51C30] text-xs font-bold">✕</button>
            )}
          </div>
        </div>
      )}

      {/* Customer panel */}
      {showCustomer && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-[#0A1D37]/5 dark:bg-[#0A1D37]/10 animate-fade-in space-y-2">
          <input type="text" value={customerName} onChange={e => onCustomerChange(e.target.value, customerPhone)}
            placeholder="Customer name" className="w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm outline-none border border-gray-200 dark:border-gray-700" />
          <input type="tel" value={customerPhone} onChange={e => onCustomerChange(customerName, e.target.value)}
            placeholder="Phone (e.g. 0712...)" className="w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm outline-none border border-gray-200 dark:border-gray-700" />
        </div>
      )}

      {/* Notes panel */}
      {showNotes && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-[#B39A74]/10 dark:bg-[#B39A74]/20 animate-fade-in">
          <textarea value={orderNotes} onChange={e => onNotesChange(e.target.value)}
            placeholder="Order notes..." rows={2} className="w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm outline-none border border-gray-200 dark:border-gray-700 resize-none" />
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
            <Trash2 size={40} className="opacity-15" />
            <p className="text-sm">No items in cart</p>
            <p className="text-xs text-gray-300">Scan or tap products to add</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.pos_product_id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 group">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{item.name}</span>
                  <span className="font-bold text-sm text-[#A51C30] dark:text-[#B39A74] ml-2 shrink-0">
                    KES {item.total_price.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">KES {item.unit_price.toLocaleString()} each</div>
              </div>
              <div className="flex bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden shrink-0">
                <button onClick={() => onUpdateQuantity(item.pos_product_id, -1)} className="p-1.5 hover:bg-[#A51C30]/10 hover:text-[#A51C30] dark:hover:bg-[#A51C30]/20 transition-colors">
                  <Minus size={14} />
                </button>
                <div className="px-3 py-1.5 font-bold text-sm text-gray-700 dark:text-gray-200 min-w-[2rem] text-center border-x border-gray-100 dark:border-gray-600">
                  {item.quantity}
                </div>
                <button onClick={() => onUpdateQuantity(item.pos_product_id, 1)} className="p-1.5 hover:bg-[#A51C30]/10 hover:text-[#A51C30] dark:hover:bg-[#A51C30]/20 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={() => onRemove(item.pos_product_id)} className="p-1 text-gray-300 hover:text-[#A51C30] opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800 backdrop-blur-md space-y-1.5">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span>KES {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-[#A51C30] dark:text-[#B39A74]">
            <span>Discount {discount.type === 'percent' ? `(${discount.value}%)` : ''}</span>
            <span>-KES {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>VAT (16%)</span>
          <span>KES {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-xl font-black text-gray-900 dark:text-gray-50 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>Total</span>
          <span className="text-[#0A1D37] dark:text-[#B39A74]">KES {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#0A1D37] to-[#1B3A5C] hover:from-[#051C11] hover:to-[#0A1D37] border border-[#B39A74]/40 disabled:opacity-50 disabled:cursor-not-allowed text-[#B39A74] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 text-base"
        >
          Charge KES {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </button>
      </div>
    </div>
  );
}

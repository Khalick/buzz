'use client';

import { useState, useEffect } from 'react';
import { History, Search, ChevronDown, ChevronRight, Calendar, Receipt, CreditCard, Banknote, Smartphone, Filter, TrendingUp } from 'lucide-react';

interface OrderRecord {
  id: string;
  receipt_number: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  discount_type: string;
  payment_method: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  created_at: string;
  items?: { name: string; quantity: number; unit_price: number; total_price: number }[];
}

interface SalesHistoryProps {
  orders: OrderRecord[];
  onViewReceipt: (order: OrderRecord) => void;
  isLoading: boolean;
}

export default function SalesHistory({ orders, onViewReceipt, isLoading }: SalesHistoryProps) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('today');

  // Filter logic
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.receipt_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchMethod = filterMethod === 'all' || o.payment_method === filterMethod;
    const orderDate = new Date(o.created_at);
    let matchDate = true;
    if (filterDate === 'today') matchDate = orderDate >= todayStart;
    else if (filterDate === 'week') matchDate = orderDate >= weekStart;
    return matchSearch && matchMethod && matchDate;
  });

  // Today's summary
  const todayOrders = orders.filter(o => new Date(o.created_at) >= todayStart);
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const todayAvg = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

  const getPaymentIcon = (method: string) => {
    if (method === 'cash') return <Banknote size={14} className="text-[#A51C30]" />;
    if (method === 'mobile_money') return <Smartphone size={14} className="text-[#B39A74]" />;
    return <CreditCard size={14} className="text-[#A51C30]" />;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold dark:text-gray-100 flex items-center gap-2 mb-3">
          <History size={18} className="text-[#A51C30]" /> Sales History
        </h2>

        {/* Today's Summary */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-[#FAF8F5] dark:bg-gray-800 border border-[#E6E1D5] dark:border-gray-700 rounded-xl p-3 text-center">
            <div className="text-lg font-black text-[#A51C30] dark:text-[#B39A74]">{todayOrders.length}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Sales</div>
          </div>
          <div className="bg-[#A51C30]/5 dark:bg-[#A51C30]/20 border border-[#B39A74]/20 rounded-xl p-3 text-center">
            <div className="text-sm font-black text-[#A51C30] dark:text-[#B39A74] truncate">KES {todayRevenue.toLocaleString()}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Revenue</div>
          </div>
          <div className="bg-[#B39A74]/5 dark:bg-[#B39A74]/10 border border-[#B39A74]/20 rounded-xl p-3 text-center">
            <div className="text-sm font-black text-[#B39A74] dark:text-[#B39A74] truncate">KES {Math.round(todayAvg).toLocaleString()}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Avg Ticket</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <input type="text" placeholder="Search receipts..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm outline-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#B39A74]" />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Filters */}
        <div className="flex gap-1.5">
          {['today', 'week', 'all'].map(d => (
            <button key={d} onClick={() => setFilterDate(d)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${filterDate === d ? 'bg-[#A51C30] text-white' : 'bg-[#FAF8F5] dark:bg-gray-800 text-[#6B6B6B] border border-[#E6E1D5] hover:bg-[#E6E1D5]/50'}`}>
              {d === 'today' ? 'Today' : d === 'week' ? '7 Days' : 'All'}
            </button>
          ))}
          <div className="w-px bg-gray-200 dark:bg-gray-700 mx-1" />
          {['all', 'cash', 'mobile_money', 'card'].map(m => (
            <button key={m} onClick={() => setFilterMethod(m)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${filterMethod === m ? 'bg-[#A51C30] text-white' : 'bg-[#FAF8F5] dark:bg-gray-800 text-[#6B6B6B] border border-[#E6E1D5] hover:bg-[#E6E1D5]/50'}`}>
              {m === 'all' ? 'All' : m === 'cash' ? '💵' : m === 'mobile_money' ? '📱' : '💳'}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="animate-spin h-6 w-6 border-2 border-[#B39A74] border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
            <Receipt size={32} className="opacity-20 mb-2" />
            No orders found
          </div>
        ) : (
          filtered.map(order => {
            const isExpanded = expandedId === order.id;
            const time = new Date(order.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
            const date = new Date(order.created_at).toLocaleDateString('en-KE', { day: '2-digit', month: 'short' });

            return (
              <div key={order.id} className="mb-1.5">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                >
                  {isExpanded ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#A51C30] dark:text-[#B39A74] font-bold">{order.receipt_number || '—'}</span>
                      {order.customer_name && <span className="text-xs text-gray-400 truncate">• {order.customer_name}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      {getPaymentIcon(order.payment_method)}
                      <span>{date} {time}</span>
                    </div>
                  </div>
                  <div className="font-bold text-sm text-gray-800 dark:text-gray-200 shrink-0">
                    KES {(order.total_amount || 0).toLocaleString()}
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="ml-7 mr-2 mb-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-2 animate-fade-in">
                    {order.items && order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{item.quantity}× {item.name}</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">KES {item.total_price?.toLocaleString()}</span>
                      </div>
                    ))}
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between text-xs text-[#A51C30] dark:text-[#B39A74]">
                        <span>Discount</span>
                        <span>-KES {order.discount_amount.toLocaleString()}</span>
                      </div>
                    )}
                    {order.notes && <div className="text-xs text-gray-400 italic">📝 {order.notes}</div>}
                    <button onClick={() => onViewReceipt(order)}
                      className="w-full mt-2 py-2 bg-[#FAF8F5] dark:bg-gray-800 border border-[#E6E1D5] dark:border-gray-700 text-[#A51C30] dark:text-[#B39A74] rounded-lg text-xs font-bold hover:bg-[#E6E1D5]/50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1">
                      <Receipt size={12} /> View Receipt
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

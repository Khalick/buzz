'use client';

import { useMemo } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Clock, CreditCard, Banknote, Smartphone, Package } from 'lucide-react';

interface SalesAnalyticsProps {
  orders: { total_amount: number; payment_method: string; created_at: string; items?: { name: string; quantity: number; total_price: number }[] }[];
}

export default function SalesAnalytics({ orders }: SalesAnalyticsProps) {
  const analytics = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Today metrics
    const todayOrders = orders.filter(o => new Date(o.created_at) >= todayStart);
    const todayRevenue = todayOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const todayItems = todayOrders.reduce((s, o) => s + (o.items?.reduce((is, i) => is + i.quantity, 0) || 0), 0);
    const todayAvg = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

    // Last 7 days revenue
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - (6 - i));
      const dayEnd = new Date(d); dayEnd.setDate(dayEnd.getDate() + 1);
      const dayOrders = orders.filter(o => { const od = new Date(o.created_at); return od >= d && od < dayEnd; });
      return {
        label: d.toLocaleDateString('en-KE', { weekday: 'short' }),
        date: d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short' }),
        revenue: dayOrders.reduce((s, o) => s + (o.total_amount || 0), 0),
        count: dayOrders.length,
      };
    });
    const maxRevenue = Math.max(...last7.map(d => d.revenue), 1);

    // Payment method breakdown
    const methods = { cash: 0, mobile_money: 0, card: 0 };
    orders.forEach(o => {
      const m = o.payment_method as keyof typeof methods;
      if (m in methods) methods[m] += o.total_amount || 0;
    });
    const totalMethods = Object.values(methods).reduce((s, v) => s + v, 0) || 1;

    // Top products
    const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach(o => {
      o.items?.forEach(i => {
        if (!productMap[i.name]) productMap[i.name] = { name: i.name, qty: 0, revenue: 0 };
        productMap[i.name].qty += i.quantity;
        productMap[i.name].revenue += i.total_price;
      });
    });
    const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const maxProductRevenue = topProducts[0]?.revenue || 1;

    // Peak hours (today)
    const hourMap: Record<number, number> = {};
    todayOrders.forEach(o => {
      const h = new Date(o.created_at).getHours();
      hourMap[h] = (hourMap[h] || 0) + 1;
    });
    const peakHours = Array.from({ length: 12 }, (_, i) => {
      const h = i + 8; // 8am to 8pm
      return { hour: h, label: `${h > 12 ? h - 12 : h}${h >= 12 ? 'pm' : 'am'}`, count: hourMap[h] || 0 };
    });
    const maxHourCount = Math.max(...peakHours.map(h => h.count), 1);

    return { todayRevenue, todayOrders: todayOrders.length, todayItems, todayAvg, last7, maxRevenue, methods, totalMethods, topProducts, maxProductRevenue, peakHours, maxHourCount };
  }, [orders]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold dark:text-gray-100 flex items-center gap-2">
          <BarChart3 size={18} className="text-[#A51C30]" /> Analytics
        </h2>
      </div>

      <div className="p-4 space-y-5">
        {/* Today Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#0A1D37] to-[#1B3A5C] border border-[#B39A74]/20 rounded-2xl p-4 text-[#B39A74]">
            <DollarSign size={16} className="opacity-60 mb-1" />
            <div className="text-xl font-black font-mono">KES {analytics.todayRevenue.toLocaleString()}</div>
            <div className="text-xs opacity-70 font-bold">Today&apos;s Revenue</div>
          </div>
          <div className="bg-gradient-to-br from-[#A51C30] to-[#8B1728] border border-[#B39A74]/20 rounded-2xl p-4 text-white">
            <ShoppingCart size={16} className="opacity-60 mb-1" />
            <div className="text-xl font-black font-mono">{analytics.todayOrders}</div>
            <div className="text-xs opacity-70 font-bold">Transactions</div>
          </div>
          <div className="bg-gradient-to-br from-[#B39A74] to-[#8F7757] border border-[#0A1D37]/20 rounded-2xl p-4 text-white">
            <TrendingUp size={16} className="opacity-60 mb-1" />
            <div className="text-xl font-black font-mono">KES {Math.round(analytics.todayAvg).toLocaleString()}</div>
            <div className="text-xs opacity-70 font-bold">Avg Ticket</div>
          </div>
          <div className="bg-gradient-to-br from-[#0A1D37] to-[#1B3A5C] border border-[#B39A74]/20 rounded-2xl p-4 text-[#B39A74]">
            <Package size={16} className="opacity-60 mb-1" />
            <div className="text-xl font-black font-mono">{analytics.todayItems}</div>
            <div className="text-xs opacity-70 font-bold">Items Sold</div>
          </div>
        </div>

        {/* 7-Day Revenue Chart */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Last 7 Days Revenue</h3>
          <div className="flex items-end gap-2 h-28">
            {analytics.last7.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] font-bold text-gray-400">{day.count > 0 ? `${day.count}` : ''}</div>
                <div className="w-full rounded-t-lg transition-all relative group cursor-pointer"
                  style={{
                    height: `${Math.max((day.revenue / analytics.maxRevenue) * 100, 4)}%`,
                    background: i === 6 ? 'linear-gradient(to top, #0A1D37, #1B3A5C)' : 'linear-gradient(to top, #e5e7eb, #d1d5db)',
                  }}>
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    KES {day.revenue.toLocaleString()}
                  </div>
                </div>
                <div className={`text-[10px] font-bold ${i === 6 ? 'text-[#0A1D37] dark:text-[#B39A74]' : 'text-gray-400'}`}>{day.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Payment Methods</h3>
          <div className="space-y-2.5">
            {[
              { key: 'cash', label: 'Cash', icon: <Banknote size={14} />, color: '#A51C30', amount: analytics.methods.cash },
              { key: 'mobile_money', label: 'M-Pesa', icon: <Smartphone size={14} />, color: '#B39A74', amount: analytics.methods.mobile_money },
              { key: 'card', label: 'Card', icon: <CreditCard size={14} />, color: '#0A1D37', amount: analytics.methods.card },
            ].map(m => {
              const pct = (m.amount / analytics.totalMethods) * 100;
              return (
                <div key={m.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-400">{m.icon}{m.label}</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 font-mono">KES {m.amount.toLocaleString()} <span className="text-gray-400 font-normal font-sans">({Math.round(pct)}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Top Selling Products</h3>
          {analytics.topProducts.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-4">No sales data yet</div>
          ) : (
            <div className="space-y-2">
              {analytics.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                    i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gray-300'
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{p.name}</div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#B39A74] rounded-full" style={{ width: `${(p.revenue / analytics.maxProductRevenue) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200 font-mono">KES {p.revenue.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400">{p.qty} sold</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Peak Hours */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1"><Clock size={12} />Today&apos;s Peak Hours</h3>
          <div className="flex gap-1 items-end h-12">
            {analytics.peakHours.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full rounded-t transition-all"
                  style={{
                    height: `${Math.max((h.count / analytics.maxHourCount) * 100, 8)}%`,
                    backgroundColor: h.count > 0 ? `rgba(10, 29, 88, ${0.3 + (h.count / analytics.maxHourCount) * 0.7})` : '#e5e7eb',
                  }} />
                <div className="text-[8px] text-gray-400 font-medium">{h.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { X, Save, Trash2, Package, Barcode, DollarSign, Hash, Tag, AlertTriangle } from 'lucide-react';
import type { POSCategory } from './CategoryManager';

export interface POSProduct {
  id: string;
  business_id: string;
  name: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  barcode?: string;
  sku?: string;
  category_id?: string;
  image_url?: string;
  is_active: boolean;
}

interface ProductManagerProps {
  products: POSProduct[];
  categories: POSCategory[];
  onSave: (product: Partial<POSProduct>) => void;
  onUpdate: (id: string, data: Partial<POSProduct>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function ProductManager({ products, categories, onSave, onUpdate, onDelete, onClose }: ProductManagerProps) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingProduct, setEditingProduct] = useState<POSProduct | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', price: '', cost_price: '', stock_quantity: '', barcode: '', sku: '', category_id: '', is_active: true,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ name: '', price: '', cost_price: '', stock_quantity: '', barcode: '', sku: '', category_id: '', is_active: true });
    setEditingProduct(null);
  };

  const openNew = () => { resetForm(); setView('form'); };
  const openEdit = (p: POSProduct) => {
    setEditingProduct(p);
    setForm({
      name: p.name, price: String(p.price), cost_price: String(p.cost_price || 0),
      stock_quantity: String(p.stock_quantity), barcode: p.barcode || '', sku: p.sku || '',
      category_id: p.category_id || '', is_active: p.is_active,
    });
    setView('form');
  };

  const handleSubmit = () => {
    if (!form.name || !form.price) return;
    const data: Partial<POSProduct> = {
      name: form.name, price: Number(form.price), cost_price: Number(form.cost_price || 0),
      stock_quantity: Number(form.stock_quantity || 0), barcode: form.barcode || undefined,
      sku: form.sku || undefined, category_id: form.category_id || undefined, is_active: form.is_active,
    };
    if (editingProduct) {
      onUpdate(editingProduct.id, data);
    } else {
      onSave(data);
    }
    resetForm();
    setView('list');
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirm(null);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search)) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const getCategoryName = (catId?: string) => categories.find(c => c.id === catId)?.name || '';
  const getCategoryColor = (catId?: string) => categories.find(c => c.id === catId)?.color || '#94a3b8';

  return (
    <div className="flex flex-col h-full">
      {view === 'list' ? (
        <>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-bold dark:text-gray-100 flex items-center gap-2">
              <Package size={18} className="text-[#A51C30]" /> Products
              <span className="text-xs font-normal bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">{products.length}</span>
            </h2>
            <button onClick={openNew} className="px-3 py-1.5 bg-[#0A1D37] hover:bg-[#1B3A5C] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
              <Plus size={14} /> New
            </button>
          </div>

          {/* Search */}
          <div className="px-4 py-2">
            <input
              type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm outline-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#B39A74]"
            />
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                <Package size={32} className="opacity-20 mb-2" />
                {products.length === 0 ? 'No products yet. Add your first!' : 'No matching products'}
              </div>
            ) : (
              filtered.map(p => (
                <div key={p.id} onClick={() => openEdit(p)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all mb-1 border border-transparent hover:border-[#B39A74]/50 ${
                    p.is_active ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'opacity-50 bg-gray-50 dark:bg-gray-800/30'
                  }`}>
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: getCategoryColor(p.category_id) }}>
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{p.name}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      {p.category_id && (
                        <span className="px-1.5 py-0.5 rounded-full text-white text-[10px] font-bold" style={{ backgroundColor: getCategoryColor(p.category_id) }}>
                          {getCategoryName(p.category_id)}
                        </span>
                      )}
                      {p.barcode && <span className="flex items-center gap-0.5"><Barcode size={10} />{p.barcode}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm text-gray-800 dark:text-gray-200">KES {p.price.toLocaleString()}</div>
                    <div className={`text-xs font-medium ${p.stock_quantity <= 5 ? 'text-[#A51C30]' : p.stock_quantity <= 10 ? 'text-[#B39A74]' : 'text-gray-400'}`}>
                      {p.stock_quantity <= 0 ? '⚠ Out' : `${p.stock_quantity} left`}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* ──── PRODUCT FORM ──── */
        <>
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-bold dark:text-gray-100">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </h2>
            <button onClick={() => { resetForm(); setView('list'); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Product Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Nyama Choma Special" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#B39A74]" />
            </div>

            {/* Price + Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign size={12} />Sell Price *</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#B39A74]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cost Price</label>
                <input type="number" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })}
                  placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#B39A74]" />
              </div>
            </div>

            {/* Stock + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Hash size={12} />Stock Qty</label>
                <input type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })}
                  placeholder="0" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#B39A74]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Tag size={12} />Category</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#B39A74] appearance-none">
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Barcode + SKU */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Barcode size={12} />Barcode</label>
                <input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })}
                  placeholder="Scan or type..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#B39A74]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">SKU</label>
                <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g. NC-001" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#B39A74]" />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Product is Active</span>
              <button onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-[#A51C30]' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${form.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Low stock warning */}
            {editingProduct && editingProduct.stock_quantity <= 5 && editingProduct.stock_quantity > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 bg-[#B39A74]/10 dark:bg-[#B39A74]/20 rounded-xl text-[#B39A74] dark:text-[#B39A74] text-sm">
                <AlertTriangle size={16} /> Low stock warning — only {editingProduct.stock_quantity} units left
              </div>
            )}

            {/* Delete button */}
            {editingProduct && (
              <div className="pt-2">
                {deleteConfirm === editingProduct.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(editingProduct.id)} className="flex-1 py-2.5 bg-[#A51C30] hover:bg-[#8B1728] text-white rounded-xl text-sm font-bold transition-colors">Yes, Delete</button>
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(editingProduct.id)} className="w-full py-2.5 text-[#A51C30] hover:bg-[#A51C30]/10 dark:hover:bg-[#A51C30]/15 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Trash2 size={14} /> Delete Product
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button onClick={handleSubmit} disabled={!form.name || !form.price}
              className="w-full py-3 bg-gradient-to-r from-[#0A1D37] to-[#1B3A5C] hover:from-[#051C11] hover:to-[#0A1D37] border border-[#B39A74]/40 text-[#B39A74] font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              <Save size={16} /> {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Plus({ size, className }: { size: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
}

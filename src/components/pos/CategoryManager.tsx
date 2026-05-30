'use client';

import { useState } from 'react';
import { X, Plus, Palette, GripVertical, Trash2, Tag } from 'lucide-react';

export interface POSCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
  business_id?: string;
}

const PRESET_COLORS = [
  '#0A1D37', '#A51C30', '#B39A74', '#1B3A5C',
  '#2B3E50', '#CBB593', '#7D1220', '#061224'
];

interface CategoryManagerProps {
  categories: POSCategory[];
  onSave: (category: Omit<POSCategory, 'id'>) => void;
  onUpdate: (id: string, data: Partial<POSCategory>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function CategoryManager({ categories, onSave, onUpdate, onDelete, onClose }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#0A1D37');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onSave({ name: newName.trim(), color: newColor, icon: 'tag', sort_order: categories.length, business_id: '' });
    setNewName('');
    setNewColor('#0A1D37');
  };

  const startEdit = (cat: POSCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      onUpdate(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-gray-100 flex items-center gap-2">
            <Tag size={20} className="text-[#A51C30]" /> Categories
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Add New */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="New category name..."
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#B39A74] focus:border-transparent"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-4 py-2.5 bg-[#0A1D37] hover:bg-[#1B3A5C] text-[#B39A74] rounded-xl text-sm font-bold disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              <Plus size={16} /> Add
            </button>
          </div>
          {/* Color picker */}
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-7 h-7 rounded-full transition-all ${newColor === c ? 'ring-2 ring-offset-2 ring-[#B39A74] scale-110' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* List */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {categories.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">No categories yet</div>
          ) : (
            categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors">
                <GripVertical size={14} className="text-gray-300 cursor-grab" />
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                {editingId === cat.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => saveEdit(cat.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(cat.id)}
                    className="flex-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded text-sm outline-none border border-[#B39A74]"
                  />
                ) : (
                  <span
                    onClick={() => startEdit(cat)}
                    className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {cat.name}
                  </span>
                )}
                {/* Color quick-change */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {PRESET_COLORS.slice(0, 4).map(c => (
                    <button
                      key={c}
                      onClick={() => onUpdate(cat.id, { color: c })}
                      className="w-4 h-4 rounded-full hover:scale-125 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => onDelete(cat.id)}
                  className="p-1 text-gray-300 hover:text-[#A51C30] opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

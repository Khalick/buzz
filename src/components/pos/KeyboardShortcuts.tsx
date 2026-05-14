'use client';

import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ['F1'], action: 'Focus search / barcode scan', category: 'Navigation' },
  { keys: ['F2'], action: 'Open checkout', category: 'Navigation' },
  { keys: ['F3'], action: 'Hold current order', category: 'Orders' },
  { keys: ['F4'], action: 'Sales history panel', category: 'Navigation' },
  { keys: ['F5'], action: 'Product manager panel', category: 'Navigation' },
  { keys: ['F6'], action: 'Analytics panel', category: 'Navigation' },
  { keys: ['F7'], action: 'Category manager', category: 'Navigation' },
  { keys: ['F8'], action: 'Clear cart', category: 'Orders' },
  { keys: ['Esc'], action: 'Close modal / panel', category: 'General' },
  { keys: ['?'], action: 'Show this help', category: 'General' },
];

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  if (!isOpen) return null;

  const categories = [...new Set(SHORTCUTS.map(s => s.category))];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-gray-100 flex items-center gap-2">
            <Keyboard size={20} className="text-indigo-500" /> Keyboard Shortcuts
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{category}</h3>
              <div className="space-y-1.5">
                {SHORTCUTS.filter(s => s.category === category).map(shortcut => (
                  <div key={shortcut.action} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.action}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map(key => (
                        <kbd key={key} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono font-bold text-gray-600 dark:text-gray-400 shadow-sm">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-400">Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-mono font-bold">Esc</kbd> to close</p>
        </div>
      </div>
    </div>
  );
}

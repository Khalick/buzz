'use client';

import { useRef } from 'react';
import { X, Printer, Share2, Phone } from 'lucide-react';

interface ReceiptData {
  receiptNumber: string;
  businessName: string;
  businessPhone?: string;
  cashierName?: string;
  items: { name: string; quantity: number; unit_price: number; total_price: number }[];
  subtotal: number;
  discountAmount: number;
  discountType: string;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  amountTendered?: number;
  changeDue?: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
}

interface ReceiptPreviewProps {
  receipt: ReceiptData;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptPreview({ receipt, isOpen, onClose }: ReceiptPreviewProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  if (!isOpen) return null;

  const paymentLabel = { cash: 'Cash', mobile_money: 'M-Pesa', card: 'Card' }[receipt.paymentMethod] || receipt.paymentMethod;
  const dateStr = new Date(receipt.createdAt).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = new Date(receipt.createdAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    const el = receiptRef.current;
    if (!el) return;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Receipt ${receipt.receiptNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; width: 80mm; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 6px 0; }
        .row { display: flex; justify-content: space-between; padding: 1px 0; }
        .item-name { flex: 1; }
        .small { font-size: 10px; color: #666; }
        h1 { font-size: 16px; margin-bottom: 4px; }
      </style></head><body>
      ${el.innerHTML}
      <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const handleWhatsApp = () => {
    let text = `🧾 *Receipt ${receipt.receiptNumber}*\n`;
    text += `📍 ${receipt.businessName}\n`;
    text += `📅 ${dateStr} ${timeStr}\n\n`;
    receipt.items.forEach(item => {
      text += `• ${item.name} x${item.quantity} — KES ${item.total_price.toLocaleString()}\n`;
    });
    text += `\n──────────────\n`;
    text += `Subtotal: KES ${receipt.subtotal.toLocaleString()}\n`;
    if (receipt.discountAmount > 0) {
      text += `Discount: -KES ${receipt.discountAmount.toLocaleString()}\n`;
    }
    text += `VAT (16%): KES ${receipt.taxAmount.toLocaleString()}\n`;
    text += `*TOTAL: KES ${receipt.total.toLocaleString()}*\n`;
    text += `\nPaid via: ${paymentLabel}\n`;
    if (receipt.changeDue && receipt.changeDue > 0) {
      text += `Change: KES ${receipt.changeDue.toLocaleString()}\n`;
    }
    text += `\n_Thank you for your purchase! 🙏_`;

    const phone = receipt.customerPhone ? receipt.customerPhone.replace(/\D/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Actions bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-gray-100">Receipt</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400" title="Print">
              <Printer size={18} />
            </button>
            <button onClick={handleWhatsApp} className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors text-green-600" title="Share via WhatsApp">
              <Share2 size={18} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          <div ref={receiptRef} className="p-6 space-y-4">
            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="h-12 w-12 bg-gradient-to-br from-[#0A1D37] to-[#1B3A5C] rounded-xl flex items-center justify-center text-[#B39A74] font-black text-xl mx-auto mb-2 shadow-lg border border-[#B39A74]/20">B</div>
              <h1 className="text-lg font-black text-gray-900 dark:text-gray-100">{receipt.businessName}</h1>
              {receipt.businessPhone && <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1"><Phone size={10} />{receipt.businessPhone}</p>}
              <p className="text-xs text-gray-400 mt-2 font-mono">{receipt.receiptNumber}</p>
            </div>

            {/* Date/Time & Cashier */}
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{dateStr} {timeStr}</span>
              {receipt.cashierName && <span>Cashier: {receipt.cashierName}</span>}
            </div>

            {/* Customer info */}
            {receipt.customerName && (
              <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                Customer: <span className="font-semibold text-gray-700 dark:text-gray-300">{receipt.customerName}</span>
                {receipt.customerPhone && <span className="ml-2">({receipt.customerPhone})</span>}
              </div>
            )}

            {/* Items */}
            <div className="space-y-2 py-2 border-y border-dashed border-gray-200 dark:border-gray-700">
              {receipt.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm">
                  <div className="flex-1">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                    <span className="text-gray-400 ml-2 text-xs">{item.quantity} × KES {item.unit_price.toLocaleString()}</span>
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 ml-4">KES {item.total_price.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>KES {receipt.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {receipt.discountAmount > 0 && (
                <div className="flex justify-between text-[#A51C30] dark:text-red-400 font-bold">
                  <span>Discount {receipt.discountType === 'percent' ? '' : ''}</span>
                  <span>-KES {receipt.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>VAT (16%)</span>
                <span>KES {receipt.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>TOTAL</span>
                <span>KES {receipt.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Payment info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">{paymentLabel}</span>
              </div>
              {receipt.amountTendered && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tendered</span>
                  <span className="font-semibold">KES {receipt.amountTendered.toLocaleString()}</span>
                </div>
              )}
              {receipt.changeDue != null && receipt.changeDue > 0 && (
                <div className="flex justify-between text-[#A51C30] dark:text-red-400 font-bold">
                  <span>Change</span>
                  <span>KES {receipt.changeDue.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {receipt.notes && (
              <div className="text-xs text-gray-500 italic bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                Note: {receipt.notes}
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-1">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Thank you for your purchase! 🙏</p>
              <p className="text-xs text-gray-400">Powered by BizHub POS</p>
            </div>
          </div>
        </div>

        {/* Bottom action */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          <button onClick={handleWhatsApp}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
            <Share2 size={16} /> WhatsApp Receipt
          </button>
          <button onClick={onClose}
            className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

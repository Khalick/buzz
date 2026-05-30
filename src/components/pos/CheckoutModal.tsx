'use client';

import { useState } from 'react';
import { X, CheckCircle, CreditCard, Banknote, Smartphone, Receipt } from 'lucide-react';
import { queueOrder } from '@/lib/posOfflineSync';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  discountAmount: number;
  discountType: string;
  taxAmount: number;
  total: number;
  items: any[];
  businessId: string;
  customerName: string;
  customerPhone: string;
  orderNotes: string;
  onComplete: (receiptData: any) => void;
}

const DENOMINATIONS = [50, 100, 200, 500, 1000, 2000, 5000];

export default function CheckoutModal({
  isOpen, onClose, subtotal, discountAmount, discountType, taxAmount, total,
  items, businessId, customerName, customerPhone, orderNotes, onComplete,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [amountTendered, setAmountTendered] = useState('');

  if (!isOpen) return null;

  const tenderedNum = Number(amountTendered) || 0;
  const changeDue = paymentMethod === 'cash' ? Math.max(0, tenderedNum - total) : 0;
  const canPay = paymentMethod !== 'cash' || tenderedNum >= total;

  const handleCheckout = async () => {
    if (!canPay) return;
    setIsProcessing(true);

    try {
      // Generate receipt number locally first so we can save it
      const now = new Date();
      const dayKey = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
      const counter = Number(localStorage.getItem(`pos-receipt-counter-${dayKey}`) || 0) + 1;
      localStorage.setItem(`pos-receipt-counter-${dayKey}`, String(counter));
      const receiptNumber = `RCP-${dayKey}-${String(counter).padStart(4, '0')}`;

      const order = {
        business_id: businessId,
        total_amount: total,
        subtotal: subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        discount_type: discountType,
        payment_method: paymentMethod,
        customer_name: customerName,
        customer_phone: customerPhone,
        notes: orderNotes,
        receipt_number: receiptNumber,
        synced: false,
        created_at: now.toISOString(),
        items: items.map(item => ({
          pos_product_id: item.pos_product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      };

      await queueOrder(order);
      setSuccess(true);

      const receiptData = {
        receiptNumber,
        businessName: 'BizHub Merchant', // Would come from business profile
        items: items.map(i => ({ name: i.name, quantity: i.quantity, unit_price: i.unit_price, total_price: i.total_price })),
        subtotal,
        discountAmount,
        discountType,
        taxAmount,
        total,
        paymentMethod,
        amountTendered: paymentMethod === 'cash' ? tenderedNum : undefined,
        changeDue: paymentMethod === 'cash' ? changeDue : undefined,
        customerName,
        customerPhone,
        notes: orderNotes,
        createdAt: new Date().toISOString(),
      };

      setTimeout(() => {
        setSuccess(false);
        setIsProcessing(false);
        setAmountTendered('');
        onComplete(receiptData);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const appendAmount = (val: string) => {
    setAmountTendered(prev => prev + val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-scale-in">
        {success ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-4 animate-scale-in">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">Payment Successful!</h2>
            {paymentMethod === 'cash' && changeDue > 0 && (
              <div className="text-2xl font-black text-[#A51C30]">
                Change: KES {changeDue.toLocaleString()}
              </div>
            )}
            <p className="text-gray-500 dark:text-gray-400">Order saved. Generating receipt...</p>
          </div>
        ) : (
          <>
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-gray-100">Checkout</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X size={22} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Total */}
              <div className="text-center">
                <p className="text-gray-500 font-medium mb-1 text-sm">Total Amount Due</p>
                <div className="text-4xl font-black bg-gradient-to-r from-[#0A1D37] to-[#1B3A5C] bg-clip-text text-transparent">
                  KES {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                {discountAmount > 0 && (
                  <div className="text-sm text-green-600 mt-1">Includes KES {discountAmount.toLocaleString()} discount</div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">Payment Method</p>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => { setPaymentMethod('cash'); setAmountTendered(''); }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'cash' ? 'border-[#B39A74] bg-[#0A1D37]/5 text-[#0A1D37] dark:bg-[#0A1D37]/30 dark:text-[#B39A74]' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#B39A74]/50'}`}>
                    <Banknote size={28} className="mb-1" />
                    <span className="font-bold text-xs">Cash</span>
                  </button>
                  <button onClick={() => setPaymentMethod('mobile_money')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'mobile_money' ? 'border-[#B39A74] bg-[#0A1D37]/5 text-[#0A1D37] dark:bg-[#0A1D37]/30 dark:text-[#B39A74]' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#B39A74]/50'}`}>
                    <Smartphone size={28} className="mb-1" />
                    <span className="font-bold text-xs">M-Pesa</span>
                  </button>
                  <button onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-[#B39A74] bg-[#0A1D37]/5 text-[#0A1D37] dark:bg-[#0A1D37]/30 dark:text-[#B39A74]' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#B39A74]/50'}`}>
                    <CreditCard size={28} className="mb-1" />
                    <span className="font-bold text-xs">Card</span>
                  </button>
                </div>
              </div>

              {/* Cash Tendering Numpad */}
              {paymentMethod === 'cash' && (
                <div className="space-y-3 animate-fade-in">
                  <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">Amount Tendered</p>
                  
                  {/* Amount display */}
                  <div className="text-center py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="text-3xl font-black text-gray-900 dark:text-gray-100 font-mono">
                      KES {amountTendered || '0'}
                    </div>
                    {tenderedNum >= total && (
                      <div className="text-sm font-bold text-[#A51C30] mt-1">
                        Change: KES {changeDue.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Quick denomination buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {DENOMINATIONS.map(d => (
                      <button key={d} onClick={() => setAmountTendered(String(d))}
                        className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                          Number(amountTendered) === d ? 'bg-[#0A1D37] text-[#B39A74]' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                        }`}>
                        {d.toLocaleString()}
                      </button>
                    ))}
                    <button onClick={() => setAmountTendered(String(Math.ceil(total)))}
                      className="px-3 py-2 rounded-lg text-sm font-bold bg-[#A51C30]/10 dark:bg-[#A51C30]/20 text-[#A51C30] dark:text-red-400 hover:bg-[#A51C30]/20 transition-colors">
                      Exact
                    </button>
                  </div>

                  {/* Numpad */}
                  <div className="grid grid-cols-3 gap-2">
                    {['1','2','3','4','5','6','7','8','9','0','00','⌫'].map(key => (
                      <button key={key}
                        onClick={() => {
                          if (key === '⌫') setAmountTendered(prev => prev.slice(0, -1));
                          else appendAmount(key);
                        }}
                        className="py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-lg font-bold text-gray-800 dark:text-gray-200 transition-colors active:scale-95"
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing || !canPay}
                className="w-full py-4 bg-gradient-to-r from-[#0A1D37] to-[#1B3A5C] hover:from-[#051C11] hover:to-[#0A1D37] border border-[#B39A74]/40 text-[#B39A74] text-lg font-bold rounded-2xl shadow-lg transition-transform transform active:scale-95 flex justify-center items-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <Receipt size={20} />
                    {paymentMethod === 'cash' && tenderedNum > 0
                      ? `Pay — Change KES ${changeDue.toLocaleString()}`
                      : `Confirm Payment`}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

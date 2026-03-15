'use client';

import { useState } from 'react';
import { Star, MapPin, Phone, X, GitCompareArrows } from 'lucide-react';
import Link from 'next/link';
import { isBusinessOpen, getTodayHours } from '@/lib/business-hours';

interface Business {
  id: string;
  name: string;
  category: string;
  location: { county: string; town: string; address: string };
  contact: { phone: string; email: string };
  rating: number;
  reviewCount: number;
  website?: string;
  businessHours?: any;
}

interface BusinessCompareProps {
  businesses: Business[];
  onClose: () => void;
}

export default function BusinessCompare({ businesses, onClose }: BusinessCompareProps) {
  if (businesses.length < 2) return null;

  const fields = [
    {
      label: '⭐ Rating',
      render: (b: Business) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-[#D4AF37] fill-[#D4AF37]" />
          <span className="font-bold">{b.rating?.toFixed(1) || '0.0'}</span>
          <span className="text-[#737373] text-xs">({b.reviewCount || 0})</span>
        </div>
      ),
    },
    {
      label: '📂 Category',
      render: (b: Business) => <span className="text-sm">{b.category}</span>,
    },
    {
      label: '📍 Location',
      render: (b: Business) => (
        <span className="text-sm">
          {b.location?.town}, {b.location?.county}
        </span>
      ),
    },
    {
      label: '📞 Phone',
      render: (b: Business) => (
        <a href={`tel:${b.contact?.phone}`} className="text-sm text-[#1B4332] hover:underline">
          {b.contact?.phone || 'N/A'}
        </a>
      ),
    },
    {
      label: '🕐 Status',
      render: (b: Business) => {
        const open = isBusinessOpen(b.businessHours);
        const hours = getTodayHours(b.businessHours);
        return (
          <div>
            <span className={`text-xs font-bold ${open ? 'text-green-600' : 'text-red-500'}`}>
              {open ? '✅ Open Now' : '❌ Closed'}
            </span>
            <p className="text-[10px] text-[#737373]">{hours}</p>
          </div>
        );
      },
    },
    {
      label: '🌐 Website',
      render: (b: Business) =>
        b.website ? (
          <a href={b.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B4332] hover:underline">
            Visit →
          </a>
        ) : (
          <span className="text-xs text-[#A3A3A3]">N/A</span>
        ),
    },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5 text-[#1B4332]" />
            <h2 className="text-lg font-bold text-[#1A1A1A]">Compare Businesses</h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#525252] hover:text-[#1B4332]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#737373] w-32"></th>
                {businesses.map((b) => (
                  <th key={b.id} className="px-4 py-3 text-center">
                    <Link href={`/business/${b.id}`} className="text-sm font-bold text-[#1B4332] hover:text-[#D4AF37] transition-colors">
                      {b.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-[#FAFAF8]' : 'bg-white'}>
                  <td className="px-6 py-3 text-xs font-semibold text-[#525252]">{field.label}</td>
                  {businesses.map((b) => (
                    <td key={b.id} className="px-4 py-3 text-center">
                      {field.render(b)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Actions Row */}
              <tr className="border-t border-[#E5E5E5]">
                <td className="px-6 py-4"></td>
                {businesses.map((b) => (
                  <td key={b.id} className="px-4 py-4 text-center">
                    <Link
                      href={`/business/${b.id}`}
                      className="inline-block bg-[#1B4332] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#2D6A4F] transition-colors"
                    >
                      View Details
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

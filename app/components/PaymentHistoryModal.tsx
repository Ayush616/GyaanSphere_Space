'use client';

import React from 'react';
import { X, Wallet, CalendarDays } from 'lucide-react';

interface PaymentHistoryModalProps {
  member: any;
  onClose: () => void;
}

export default function PaymentHistoryModal({ member, onClose }: PaymentHistoryModalProps) {
  const getPaymentDate = (entry: any) => {
    const rawDate = entry?.date ?? entry?.paymentDate;
    return rawDate ? new Date(rawDate) : new Date(0);
  };

  const paymentHistory = Array.isArray(member?.paymentHistory)
    ? [...member.paymentHistory].sort(
        (a: any, b: any) => getPaymentDate(b).getTime() - getPaymentDate(a).getTime()
      )
    : [];

  const totalPaid = paymentHistory.reduce((sum: number, entry: any) => sum + Number(entry.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-900 p-2 rounded-xl transition-colors"
          aria-label="Close payment history"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Wallet className="w-4 h-4" />
            <span>Payment History</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">{member?.name || 'Member'}</h3>
          <p className="text-xs text-slate-400 mt-1">
            Seat #{member?.seatNumber || '—'} • Total paid: ₹{totalPaid.toLocaleString()}
          </p>
        </div>

        {paymentHistory.length > 0 ? (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {paymentHistory.map((entry: any, index: number) => (
              <div key={`${entry.paymentDate || index}-${index}`} className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-emerald-400 font-bold text-sm">₹{Number(entry.amount || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">{entry.mode || 'Cash'}</div>
                  </div>
                  <div className="text-right text-[10px] text-slate-400">
                    <div className="flex items-center gap-1 justify-end">
                      <CalendarDays className="w-3 h-3" />
                      <span>{getPaymentDate(entry).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {entry.remark && (
                  <div className="mt-2 text-[10px] text-slate-300 border-t border-slate-800 pt-2">
                    {entry.remark}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-700 rounded-2xl p-6 text-center text-xs text-slate-500">
            No payment history available for this member yet.
          </div>
        )}
      </div>
    </div>
  );
}

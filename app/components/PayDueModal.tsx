'use client';

import React, { useState } from 'react';
import { IndianRupee, Calendar, X, CreditCard } from 'lucide-react';

interface PayDueModalProps {
  member: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PayDueModal({ member, onClose, onSuccess }: PayDueModalProps) {
  const formatDateForInput = (d: Date) => d.toISOString().split('T')[0];

  const [paymentAmount, setPaymentAmount] = useState(member.dueAmount || 0);
  const [paymentDate, setPaymentDate] = useState(formatDateForInput(new Date()));
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Both (Cash & UPI)'>('UPI');
  const [cashAmount, setCashAmount] = useState(0);
  const [upiAmount, setUpiAmount] = useState(member.dueAmount || 0);
  const [remark, setRemark] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleModeChange = (mode: any) => {
    setPaymentMode(mode);
    if (mode === 'Cash') {
      setCashAmount(paymentAmount);
      setUpiAmount(0);
    } else if (mode === 'UPI') {
      setUpiAmount(paymentAmount);
      setCashAmount(0);
    }
  };

  const handleAmountChange = (val: number) => {
    setPaymentAmount(val);
    if (paymentMode === 'Cash') setCashAmount(val);
    if (paymentMode === 'UPI') setUpiAmount(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (paymentAmount > member.dueAmount) {
      setError(`Payment amount cannot exceed remaining due balance of ₹${member.dueAmount}`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/members/pay-due', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member._id,
          paymentAmount,
          paymentDate,
          paymentMode,
          cashAmount,
          upiAmount,
          remark,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to record payment.');
      }
    } catch (err) {
      setError('Network error while recording payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-900 p-2 rounded-xl transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-extrabold text-white">Collect Due Payment</h3>
          <p className="text-xs text-slate-400 mt-1">
            Recording installment for <span className="text-cyan-400 font-bold">{member.name}</span> (Seat #{member.seatNumber})
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl mb-4 flex items-center justify-between text-xs">
          <span className="text-slate-300">Current Due Balance:</span>
          <span className="text-amber-400 font-extrabold text-sm">₹{member.dueAmount}</span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Amount (₹)</label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
              <input 
                type="number" required min={1} max={member.dueAmount}
                value={paymentAmount} 
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                <input 
                  type="date" required 
                  value={paymentDate} 
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Mode</label>
              <select 
                value={paymentMode} 
                onChange={(e) => handleModeChange(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Both (Cash & UPI)">Split (Cash & UPI)</option>
              </select>
            </div>
          </div>

          {paymentMode === 'Both (Cash & UPI)' && (
            <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cash Amt (₹)</label>
                <input 
                  type="number" value={cashAmount} 
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">UPI Amt (₹)</label>
                <input 
                  type="number" value={upiAmount} 
                  onChange={(e) => setUpiAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Remark / Transaction Note</label>
            <input 
              type="text" placeholder="e.g. Balance installment paid via Google Pay"
              value={remark} 
              onChange={(e) => setRemark(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button" onClick={onClose}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Confirm & Save Payment'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
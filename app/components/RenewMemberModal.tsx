'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, IndianRupee, RefreshCw, X } from 'lucide-react';

interface RenewMemberModalProps {
  member: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RenewMemberModal({ member, onClose, onSuccess }: RenewMemberModalProps) {
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [selectedPlanName, setSelectedPlanName] = useState(member?.planName || '');
  const [planDuration, setPlanDuration] = useState<number>(1);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Both (Cash & UPI)'>('UPI');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [remark, setRemark] = useState('');
  const [feesPaid, setFeesPaid] = useState<number>(0);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [upiAmount, setUpiAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await fetch('/api/plans');
        const result = await res.json();
        if (res.ok && result.success) {
          const plans = result.data || [];
          setAvailablePlans(plans);

          const defaultPlan = plans.find((plan: any) => plan.name === member?.planName) || plans[0];
          if (defaultPlan) {
            setSelectedPlanName(defaultPlan.name);
            setPlanDuration(Number(defaultPlan.durationMonths || 1));
            setFeesPaid(Number(defaultPlan.price || 0));
            syncPaymentAmounts('UPI', Number(defaultPlan.price || 0));
          }
        }
      } catch (err) {
        console.error('Failed to load plans', err);
      }
    };

    loadPlans();
  }, [member]);

  const selectedPlan = useMemo(
    () => availablePlans.find((plan) => plan.name === selectedPlanName) || availablePlans[0] || null,
    [availablePlans, selectedPlanName]
  );

  const syncPaymentAmounts = (mode: 'Cash' | 'UPI' | 'Both (Cash & UPI)', amount: number) => {
    if (mode === 'Cash') {
      setCashAmount(amount);
      setUpiAmount(0);
      return;
    }

    if (mode === 'UPI') {
      setCashAmount(0);
      setUpiAmount(amount);
      return;
    }

    const cashValue = Number((amount / 2).toFixed(2));
    setCashAmount(cashValue);
    setUpiAmount(Number((amount - cashValue).toFixed(2)));
  };

  useEffect(() => {
    if (!selectedPlan) return;

    const planPrice = Number(selectedPlan.price || 0);
    setPlanDuration(Number(selectedPlan.durationMonths || 1));
    setFeesPaid(planPrice);
    syncPaymentAmounts(paymentMode, planPrice);
  }, [selectedPlan]);

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const planName = e.target.value;
    const plan = availablePlans.find((item) => item.name === planName) || availablePlans[0];

    if (!plan) return;

    setSelectedPlanName(plan.name);
    setPlanDuration(Number(plan.durationMonths || 1));
    setFeesPaid(Number(plan.price || 0));
    syncPaymentAmounts(paymentMode, Number(plan.price || 0));
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as 'Cash' | 'UPI' | 'Both (Cash & UPI)';
    setPaymentMode(mode);
    syncPaymentAmounts(mode, feesPaid);
  };

  const handleFeesPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextAmount = Number(e.target.value) || 0;
    setFeesPaid(nextAmount);
    syncPaymentAmounts(paymentMode, nextAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const totalFee = Number(selectedPlan?.price || 0);
    if (Number(feesPaid) < 0 || Number(feesPaid) > totalFee) {
      setError(`Renewal payment must be between ₹0 and ₹${totalFee}.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/members/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member._id,
          planName: selectedPlanName,
          extensionMonths: planDuration,
          totalFee,
          feesPaid: Number(feesPaid),
          paymentDate,
          paymentMode,
          cashAmount: Number(cashAmount || 0),
          upiAmount: Number(upiAmount || 0),
          remark: remark || `Membership renewed for ${planDuration} month(s)`,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Renewal failed.');
      }
    } catch (err) {
      setError('Network error while renewing the membership.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">Membership Renewal</p>
            <h3 className="text-lg font-bold text-white mt-1">{member?.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Renewal Plan</label>
              <select
                value={selectedPlanName}
                onChange={handlePlanChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {availablePlans.map((plan) => (
                  <option key={plan._id || plan.name} value={plan.name}>
                    {plan.name} ({plan.durationMonths} mo)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Amount</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min={0}
                  readOnly
                  value={selectedPlan?.price || 0}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment mode</label>
              <select
                value={paymentMode}
                onChange={handleModeChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Both (Cash & UPI)">Both (Cash & UPI)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Amount Paid Now</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min={0}
                  max={selectedPlan?.price || 0}
                  value={feesPaid}
                  onChange={handleFeesPaidChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Extension</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>{planDuration} month(s)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cash Amount</label>
              <input
                type="number"
                step="0.01"
                value={cashAmount}
                onChange={(e) => setCashAmount(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">UPI Amount</label>
              <input
                type="number"
                step="0.01"
                value={upiAmount}
                onChange={(e) => setUpiAmount(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Remarks</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
              placeholder="Optional renewal note"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-3 py-2 text-[11px]">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all disabled:opacity-60"
            >
              {loading ? 'Renewing...' : 'Renew Membership'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

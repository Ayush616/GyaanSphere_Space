'use client';

import React, { useRef, useState, useEffect } from 'react';
import { User, Phone, Shield, Armchair, IndianRupee, Calendar, X } from 'lucide-react';

interface RegisterMemberModalProps {
  libraryId: string;
  totalSeats: number;
  seatSections: Array<{ prefix: string; count: number }>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterMemberModal({ libraryId, totalSeats, seatSections = [], onClose, onSuccess }: RegisterMemberModalProps) {
  // Utility helper to format Date object into YYYY-MM-DD for standard <input type="date" />
  const formatDateForInput = (d: Date) => d.toISOString().split('T')[0];

  const today = new Date();
  const initialExpiry = new Date();
  initialExpiry.setMonth(today.getMonth() + 1);
  const generateAvailableSeats = () => {
    if (!seatSections || seatSections.length === 0) {
      // Fallback to pure numbers if no sections are defined
      return Array.from({ length: totalSeats }, (_, i) => `${i + 1}`);
    }

    const seats: string[] = [];
    seatSections.forEach(section => {
      for (let i = 1; i <= section.count; i++) {
        seats.push(`${section.prefix}${i}`);
      }
    });
    return seats;
  };

  const allSeats = generateAvailableSeats();
  const [formData, setFormData] = useState({
    name: '',
    aadhaarId: '',
    mobile: '',
    email: '',
    planName: 'Full Day Monthly',
    basePrice: 1100,
    discount: 0,
    totalFee: 1100,      // Total agreed amount after discount
    feesPaid: 1100,      // Upfront payment made today
    dueAmount: 0,        // Remaining due balance
    seatNumber: allSeats[0] || '1',
    startDate: formatDateForInput(today),
    expiryDate: formatDateForInput(initialExpiry),
    paymentDate: formatDateForInput(new Date()),
    paymentMode: 'UPI' as 'Cash' | 'UPI' | 'Both (Cash & UPI)',
    cashAmount: 0,
    upiAmount: 1100,
    remark: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const startDateRef = useRef<HTMLInputElement>(null);
  const expiryDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await fetch('/api/plans');
        const result = await res.json();
        if (res.ok && result.success) {
          setAvailablePlans(result.data || []);
        }
      } catch (err) {
        console.error('Failed to load plans', err);
      }
    };

    loadPlans();
  }, []);

  useEffect(() => {
    if (!availablePlans.length) return;

    const currentPlanExists = availablePlans.some((plan) => plan.name === formData.planName);
    if (!currentPlanExists) {
      const firstPlan = availablePlans[0];
      const firstPrice = Number(firstPlan.price || 0);
      const newExpiry = new Date(formData.startDate || Date.now());
      newExpiry.setMonth(newExpiry.getMonth() + Number(firstPlan.durationMonths || 1));

      setFormData((prev) => ({
        ...prev,
        planName: firstPlan.name,
        basePrice: firstPrice,
        totalFee: Math.max(0, firstPrice - (prev.discount || 0)),
        feesPaid: Math.min(prev.feesPaid || 0, Math.max(0, firstPrice - (prev.discount || 0))),
        dueAmount: Math.max(0, Math.max(0, firstPrice - (prev.discount || 0)) - Math.min(prev.feesPaid || 0, Math.max(0, firstPrice - (prev.discount || 0)))),
        expiryDate: formatDateForInput(newExpiry),
      }));
    }
  }, [availablePlans]);

  const openDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.focus();
    if (typeof ref.current?.showPicker === 'function') {
      ref.current.showPicker();
    }
  };

  // Auto-recalculate Expiry Date based on selected plan and current Start Date
  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlan = availablePlans.find((plan) => plan.name === e.target.value) || availablePlans[0];
    const plan = selectedPlan?.name || e.target.value;
    const price = Number(selectedPlan?.price ?? formData.basePrice ?? 1100);
    const monthsToAdd = Number(selectedPlan?.durationMonths ?? 1);

    const currentStart = new Date(formData.startDate || Date.now());
    const newExpiry = new Date(currentStart);
    newExpiry.setMonth(newExpiry.getMonth() + monthsToAdd);

    const total = Math.max(0, price - formData.discount);
    setFormData({
      ...formData,
      planName: plan,
      basePrice: price,
      totalFee: total,
      feesPaid: total,
      dueAmount: 0,
      expiryDate: formatDateForInput(newExpiry),
      upiAmount: formData.paymentMode === 'Both (Cash & UPI)' ? formData.upiAmount : total,
      cashAmount: formData.paymentMode === 'Both (Cash & UPI)' ? formData.cashAmount : 0,
    });
  };

  // When Start Date is changed manually, update Expiry Date accordingly
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartStr = e.target.value;
    const newStart = new Date(newStartStr);
    let monthsToAdd = 1;

    if (formData.planName === 'Quarterly Plan') monthsToAdd = 3;
    if (formData.planName === 'Half-Yearly Plan') monthsToAdd = 6;

    const newExpiry = new Date(newStart);
    newExpiry.setMonth(newExpiry.getMonth() + monthsToAdd);

    setFormData({
      ...formData,
      startDate: newStartStr,
      expiryDate: formatDateForInput(newExpiry),
    });
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const disc = Number(e.target.value) || 0;
    const total = Math.max(0, formData.basePrice - disc);
    const paid = Math.min(formData.feesPaid, total);
    const due = Math.max(0, total - paid);

    setFormData({
      ...formData,
      discount: disc,
      totalFee: total,
      feesPaid: paid,
      dueAmount: due,
      upiAmount: formData.paymentMode === 'Both (Cash & UPI)' ? formData.upiAmount : paid,
    });
  };

  const handleUpfrontPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const paidNow = Number(e.target.value) || 0;
    const calculatedDue = Math.max(0, formData.totalFee - paidNow);

    setFormData({
      ...formData,
      feesPaid: paidNow,
      dueAmount: calculatedDue,
      upiAmount: formData.paymentMode === 'UPI' ? paidNow : formData.upiAmount,
      cashAmount: formData.paymentMode === 'Cash' ? paidNow : formData.cashAmount,
    });
  };

  const handlePaymentModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as any;
    setFormData({
      ...formData,
      paymentMode: mode,
      cashAmount: mode === 'Cash' ? formData.feesPaid : mode === 'Both (Cash & UPI)' ? formData.cashAmount : 0,
      upiAmount: mode === 'UPI' ? formData.feesPaid : mode === 'Both (Cash & UPI)' ? formData.upiAmount : 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libraryId, ...formData }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSuccessMessage('Member registered successfully.');
        setError(null);
        onSuccess();
        setTimeout(() => onClose(), 1200);
      } else {
        setError(result.error || 'Failed to register member.');
      }
    } catch (err: any) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl my-8">

        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-900 p-2 rounded-xl transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-extrabold text-white">Register New Library Member</h3>
          <p className="text-xs text-slate-400 mt-1">Assign desk space, record start & expiry dates, split payments, and discounts.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Student Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text" name="name" required placeholder="e.g. Rahul Sharma"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Aadhaar ID (Last 4 digits)</label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text" name="aadhaarId" required maxLength={12} placeholder="4321"
                  value={formData.aadhaarId} onChange={(e) => setFormData({ ...formData, aadhaarId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="tel" name="mobile" required placeholder="9876543210"
                  value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Seat Number (1 - {totalSeats})</label>
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Seat Number</label>
                <select
                  value={formData.seatNumber}
                  onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                >
                  {allSeats.map((seat) => (
                    <option key={seat} value={seat}>
                      Seat #{seat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* START DATE & EXPIRY DATE SELECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-cyan-400 mb-1">Start Date</label>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Open start date picker"
                  onClick={() => openDatePicker(startDateRef)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-cyan-400"
                >
                  <Calendar className="w-4 h-4 pointer-events-none" />
                </button>
                <input
                  ref={startDateRef}
                  type="date" required value={formData.startDate} onChange={handleStartDateChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">Expiry Date (End Date)</label>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Open expiry date picker"
                  onClick={() => openDatePicker(expiryDateRef)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-amber-400"
                >
                  <Calendar className="w-4 h-4 pointer-events-none" />
                </button>
                <input
                  ref={expiryDateRef}
                  type="date" required value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Membership Plan</label>
              <select
                value={formData.planName}
                onChange={handlePlanChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                disabled={availablePlans.length === 0}
              >
                {availablePlans.length > 0 ? (
                  availablePlans.map((plan) => (
                    <option key={plan._id} value={plan.name}>
                      {plan.name} (₹{Number(plan.price || 0).toLocaleString()})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Full Day Monthly">Full Day Monthly (₹1,100)</option>
                    <option value="Quarterly Plan">Quarterly Plan (₹2,950)</option>
                    <option value="Half-Yearly Plan">Half-Yearly Plan (₹5,500)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Discount (₹)</label>
              <input
                type="number" min={0} value={formData.discount} onChange={handleDiscountChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Fee (₹)</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number" readOnly value={formData.totalFee}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* PARTIAL PAYMENT & DUES ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">Amount Paid Today (Upfront ₹)</label>
              <input
                type="number" min={0} max={formData.totalFee} value={formData.feesPaid} onChange={handleUpfrontPaymentChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">Remaining Due Balance (₹)</label>
              <input
                type="number" readOnly value={formData.dueAmount}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Date</label>
              <div className="relative">
                <input
                  type="date" required
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Mode (for Today's Paid Amount)</label>
              <select
                value={formData.paymentMode} onChange={handlePaymentModeChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Both (Cash & UPI)">Both (Cash & UPI Split)</option>
              </select>
            </div>

            {formData.paymentMode === 'Both (Cash & UPI)' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cash Amt (₹)</label>
                  <input
                    type="number" value={formData.cashAmount}
                    onChange={(e) => setFormData({ ...formData, cashAmount: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">UPI Amt (₹)</label>
                  <input
                    type="number" value={formData.upiAmount}
                    onChange={(e) => setFormData({ ...formData, upiAmount: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Reference / Note</label>
                <input
                  type="text" placeholder="Optional transaction ID or note"
                  value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          {formData.paymentMode === 'Both (Cash & UPI)' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Remark / Notes</label>
              <input
                type="text" placeholder="e.g. ₹500 cash given, remaining ₹600 via UPI"
                value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div className="pt-4 flex space-x-3">
            <button
              type="button" onClick={onClose}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Save Member & Payment'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
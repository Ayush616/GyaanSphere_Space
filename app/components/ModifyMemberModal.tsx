'use client';

import React, { useRef, useState, useEffect } from 'react';
import { User, Phone, Shield, Armchair, IndianRupee, Calendar, X } from 'lucide-react';

interface ModifyMemberModalProps {
  member: any;
  totalSeats: number;
  seatSections?: Array<{ prefix: string; count: number }>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModifyMemberModal({ member, totalSeats, seatSections = [], onClose, onSuccess }: ModifyMemberModalProps) {
  const generateAvailableSeats = () => {
    if (!seatSections || seatSections.length === 0) {
      return Array.from({ length: totalSeats }, (_, i) => `${i + 1}`);
    }

    const seats: string[] = [];
    seatSections.forEach((section) => {
      for (let i = 1; i <= section.count; i++) {
        seats.push(`${section.prefix}${i}`);
      }
    });
    return seats;
  };

  const allSeats = generateAvailableSeats();

  const [formData, setFormData] = useState({
    name: member.name || '',
    aadhaarId: '',
    mobile: member.mobile || '',
    planName: member.planName || 'Full Day Monthly',
    seatNumber: String(member.seatNumber || allSeats[0] || '1'),
    startDate: member.startDate ? member.startDate.split('T')[0] : '',
    expiryDate: member.expiryDate ? member.expiryDate.split('T')[0] : '',
    status: member.status || 'Active',
    totalFee: member.totalFee || member.feesPaid || 0,
    feesPaid: member.feesPaid || 0,
    dueAmount: member.dueAmount || 0,
    discount: member.discount || 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: member.paymentMode || 'UPI',
    remark: member.remark || '',
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

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlan = availablePlans.find((plan) => plan.name === e.target.value) || availablePlans[0];
    if (!selectedPlan) return;

    const price = Number(selectedPlan.price ?? formData.totalFee ?? 0);
    const durationMonths = Number(selectedPlan.durationMonths ?? 1);
    const start = new Date(formData.startDate || new Date());
    const expiry = new Date(start);
    expiry.setMonth(expiry.getMonth() + durationMonths);

    const total = Math.max(0, price - Number(formData.discount || 0));
    setFormData({
      ...formData,
      planName: selectedPlan.name,
      totalFee: total,
      feesPaid: Math.min(Number(formData.feesPaid || 0), total),
      dueAmount: Math.max(0, total - Math.min(Number(formData.feesPaid || 0), total)),
      expiryDate: expiry.toISOString().split('T')[0],
    });
  };

  const openDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.focus();
    if (typeof ref.current?.showPicker === 'function') {
      ref.current.showPicker();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/members/${member._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSuccessMessage('Member updated successfully.');
        setError(null);
        onSuccess();
        setTimeout(() => onClose(), 1200);
      } else {
        setError(result.error || 'Failed to update booking.');
      }
    } catch (err: any) {
      setError('Network error while updating booking.');
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
          <h3 className="text-xl font-extrabold text-white">Modify Booking & Dates</h3>
          <p className="text-xs text-slate-400 mt-1">Update student details, active schedule dates, and payment records.</p>
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
                  type="text" required value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input 
                  type="tel" required value={formData.mobile} 
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Seat Number</label>
              <div className="relative">
                <Armchair className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <select
                  value={String(formData.seatNumber)}
                  onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                >
                  {allSeats.map((seat) => (
                    <option key={seat} value={seat}>
                      Seat #{seat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Membership Status</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Active">Active</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {/* DATES MODIFICATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
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
                  type="date" required value={formData.startDate} 
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">Expiry Date</label>
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
                  <option value={formData.planName}>{formData.planName}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Fee (₹)</label>
              <input 
                type="number" value={formData.totalFee} 
                onChange={(e) => setFormData({ ...formData, totalFee: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">Due Amount (₹)</label>
              <input 
                type="number" value={formData.dueAmount} 
                onChange={(e) => setFormData({ ...formData, dueAmount: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Date</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Both (Cash & UPI)">Both (Cash & UPI)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Remark / Notes</label>
            <input 
              type="text" placeholder="Optional notes or modification reason"
              value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
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
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Update Booking'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
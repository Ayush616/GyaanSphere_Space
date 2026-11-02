'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, IndianRupee, Clock, Trash2, CheckCircle2 } from 'lucide-react';

export default function ManagePlansTab({ readOnly = false }: { readOnly?: boolean }) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    durationMonths: 1,
    price: '',
    description: '',
  });

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      const result = await res.json();
      if (res.ok && result.success) {
        setPlans(result.data);
      }
    } catch (err) {
      console.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setFormData({ name: '', durationMonths: 1, price: '', description: '' });
        setShowAddForm(false);
        fetchPlans();
      } else {
        alert(result.error || 'Failed to create plan.');
      }
    } catch (err) {
      alert('Network error while creating plan.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Membership Plans</h3>
          <p className="text-xs text-slate-400 mt-1">
            {readOnly
              ? 'Current pricing tiers available for registration. This view is read-only for staff.'
              : 'Configure pricing tiers and durations available during student registration.'}
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Cancel' : 'Add New Plan'}</span>
          </button>
        )}
      </div>

      {!readOnly && showAddForm && (
        <form onSubmit={handleCreatePlan} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl max-w-xl">
          <h4 className="text-sm font-bold text-white mb-2">Create Membership Plan</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Name</label>
              <input
                type="text" required placeholder="e.g. Full Day Monthly"
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Months)</label>
              <input
                type="number" min={1} required
                value={formData.durationMonths} onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₹)</label>
              <input
                type="number" min={0} required placeholder="1100"
                value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Timings</label>
              <input
                type="text" placeholder="e.g. 6 AM to 10 PM access"
                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all"
          >
            Save Plan
          </button>
        </form>
      )}

      {/* PLANS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan._id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">{plan.name}</span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                </span>
              </div>
              <div className="text-2xl font-black text-white mb-2 flex items-center">
                <IndianRupee className="w-5 h-5 mr-0.5 text-emerald-400" /> {plan.price}
              </div>
              <div className="text-xs text-slate-400 flex items-center mb-4">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Duration: {plan.durationMonths} Month(s)
              </div>
              {plan.description && (
                <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  {plan.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
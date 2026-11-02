'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, IndianRupee, Calendar } from 'lucide-react';

export default function CashDrawerTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    personName: '',
    remark: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const fetchCashData = async () => {
    try {
      const res = await fetch('/api/cash');
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to load cash drawer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashData();
  }, []);

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'OUTFLOW',
          category: 'Expense',
          ...expenseForm,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setShowExpenseModal(false);
        setExpenseForm({ amount: '', personName: '', remark: '', paymentDate: new Date().toISOString().split('T')[0] });
        fetchCashData();
      } else {
        alert(result.error || 'Failed to record expense.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  if (loading) return <div className="text-xs text-slate-400 p-6">Loading cash drawer ledger...</div>;

  return (
    <div className="space-y-6">
      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Cash in Drawer (Balance)</span>
          <div className="text-2xl font-black text-emerald-400 flex items-center">
            <IndianRupee className="w-6 h-6 mr-1" /> {data?.drawerBalance || 0}
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block">Live physical cash reconciliation</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Cash Inflows</span>
          <div className="text-2xl font-black text-cyan-400 flex items-center">
            <ArrowDownRight className="w-6 h-6 mr-1 text-cyan-400" /> ₹{data?.totalInflow || 0}
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block">From registrations & due payments</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Cash Outflows (Expenses)</span>
          <div className="text-2xl font-black text-amber-400 flex items-center">
            <ArrowUpRight className="w-6 h-6 mr-1 text-amber-400" /> ₹{data?.totalOutflow || 0}
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block">From drawer withdrawals & vendor payouts</span>
        </div>
      </div>

      {/* ACTION HEADER */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h3 className="text-lg font-bold text-white">Cash Ledger & Drawer History</h3>
          <p className="text-xs text-slate-400">Complete audit trail of all physical cash movements.</p>
        </div>
        <button
          onClick={() => setShowExpenseModal(!showExpenseModal)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Record Cash Outflow (Expense)</span>
        </button>
      </div>

      {/* EXPENSE MODAL */}
      {showExpenseModal && (
        <form onSubmit={handleRecordExpense} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl max-w-xl">
          <h4 className="text-sm font-bold text-white">Record Cash Outflow (e.g. AC Repair)</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Amount Paid (₹)</label>
              <input
                type="number" min={1} required placeholder="500"
                value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Paid To (Person / Vendor)</label>
              <input
                type="text" placeholder="e.g. AC Repair Guy"
                value={expenseForm.personName} onChange={(e) => setExpenseForm({ ...expenseForm, personName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Date</label>
              <input
                type="date" required
                value={expenseForm.paymentDate} onChange={(e) => setExpenseForm({ ...expenseForm, paymentDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Remark / Reason</label>
              <input
                type="text" required placeholder="e.g. Office AC servicing"
                value={expenseForm.remark} onChange={(e) => setExpenseForm({ ...expenseForm, remark: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all"
          >
            Deduct from Cash Drawer
          </button>
        </form>
      )}

      {/* TRANSACTIONS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-3 font-semibold">Date</th>
              <th className="pb-3 font-semibold">Type</th>
              <th className="pb-3 font-semibold">Category</th>
              <th className="pb-3 font-semibold">Entity / Person</th>
              <th className="pb-3 font-semibold">Remark</th>
              <th className="pb-3 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data?.transactions?.map((tx: any) => (
              <tr key={tx._id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3.5 text-slate-300">
                  {new Date(tx.paymentDate).toLocaleDateString()}
                </td>
                <td className="py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    tx.type === 'INFLOW' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="py-3.5 text-slate-200 font-semibold">{tx.category}</td>
                <td className="py-3.5 text-slate-300">{tx.personName || '—'}</td>
                <td className="py-3.5 text-slate-400">{tx.remark}</td>
                <td className={`py-3.5 text-right font-bold text-sm ${
                  tx.type === 'INFLOW' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {tx.type === 'INFLOW' ? '+' : '-'}₹{tx.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
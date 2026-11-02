'use client';

import React, { useState } from 'react';
import { Settings, Plus, Trash2, Save, Armchair } from 'lucide-react';

export default function SeatsConfigTab({ initialSections, onUpdate, onClose }: any) {
  const [sections, setSections] = useState<Array<{ prefix: string; count: number }>>(
    initialSections || [
      { prefix: 'A', count: 20 },
      { prefix: 'B', count: 20 },
    ]
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddSection = () => {
    setSections([...sections, { prefix: '', count: 10 }]);
  };

  const handleRemoveSection = (index: number) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
  };

  const handleSectionChange = (index: number, field: string, value: any) => {
    const updated: any = [...sections];
    updated[index][field] = field === 'count' ? Number(value) : value.toUpperCase();
    setSections(updated);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const totalCalculatedSeats = sections.reduce((acc, curr) => acc + curr.count, 0);

    try {
      const res = await fetch('/api/library/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          totalSeats: totalCalculatedSeats, 
          seatSections: sections 
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setMessage('Seat sections and layout updated successfully!');
        if (onUpdate) onUpdate();
        if (onClose) {
          setTimeout(() => onClose(), 900);
        }
      } else {
        setMessage(result.error || 'Failed to update sections.');
      }
    } catch (err) {
      setMessage('Network error while saving configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl max-w-xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-2xl">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Multi-Section Seat Layout (A, B, C...)</h3>
            <p className="text-xs text-slate-400">Configure separate rows/sections with individual letter prefixes.</p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl p-2"
          >
            Close
          </button>
        )}
      </div>

      {message && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 p-3 rounded-xl text-xs mb-6">
          {message}
        </div>
      )}

      <form onSubmit={handleSaveConfig} className="space-y-4">
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">Seat Sections</label>
          
          {sections.map((sec, index) => (
            <div key={index} className="flex items-center space-x-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Prefix</span>
                <input 
                  type="text" placeholder="A" maxLength={2} required
                  value={sec.prefix} 
                  onChange={(e) => handleSectionChange(index, 'prefix', e.target.value)}
                  className="w-16 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white text-center font-mono uppercase focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex-1">
                <span className="text-[10px] text-slate-400 block mb-1">Seat Count</span>
                <input 
                  type="number" min={1} required
                  value={sec.count} 
                  onChange={(e) => handleSectionChange(index, 'count', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <button
                type="button" onClick={() => handleRemoveSection(index)}
                className="text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-colors mt-4"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button" onClick={handleAddSection}
          className="w-full bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Section (e.g., Section C)</span>
        </button>

        <button
          type="submit" disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Layout...' : 'Save Multi-Section Configuration'}</span>
        </button>
      </form>
    </div>
  );
}
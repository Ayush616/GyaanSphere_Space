'use client';

import React, { useState } from 'react';
import { MapPin, Wifi, CheckCircle, LogOut } from 'lucide-react';

interface StaffPunchButtonProps {
  isPunchedIn: boolean;
  onPunchSuccess: () => void;
}

export default function StaffPunchButton({ isPunchedIn = false, onPunchSuccess }: StaffPunchButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handlePunch = async (action: 'IN' | 'OUT') => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Check if browser supports Geolocation
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    // 2. Request current GPS coordinates
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch('/api/staff/punch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          });

          const result = await res.json();

          if (res.ok && result.success) {
            setSuccessMsg(result.message || 'Action completed successfully!');
            if (onPunchSuccess) onPunchSuccess();
          } else {
            setErrorMsg(result.error || 'Punch action failed.');
          }
        } catch (err) {
          setErrorMsg('Network error while processing attendance.');
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setLoading(false);
        setErrorMsg('Location access denied. Please enable GPS permissions to verify your attendance.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl max-w-sm w-full text-center space-y-4">
      {/* Security badges indicator */}
      <div className="flex justify-center space-x-2 text-xs font-semibold text-slate-400">
        <span className="flex items-center text-cyan-400">
          <Wifi className="w-3.5 h-3.5 mr-1" /> Office Wi-Fi
        </span>
        <span>•</span>
        <span className="flex items-center text-emerald-400">
          <MapPin className="w-3.5 h-3.5 mr-1" /> GPS Geofence
        </span>
      </div>

      {/* Error Feedback */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs text-left">
          {errorMsg}
        </div>
      )}

      {/* Success Feedback */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-2xl text-xs text-left">
          {successMsg}
        </div>
      )}

      {/* Punch In / Out Button */}
      {!isPunchedIn ? (
        <button
          onClick={() => handlePunch('IN')}
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          <CheckCircle className="w-5 h-5" />
          <span>{loading ? 'Verifying Location & Wi-Fi...' : 'PUNCH IN FOR SHIFT'}</span>
        </button>
      ) : (
        <button
          onClick={() => handlePunch('OUT')}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-400 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>{loading ? 'Processing Check Out...' : 'PUNCH OUT OF SHIFT'}</span>
        </button>
      )}
    </div>
  );
}
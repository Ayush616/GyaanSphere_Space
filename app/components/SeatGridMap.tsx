'use client';

import React, { useState } from 'react';
import { Armchair, Calendar, IndianRupee, Phone } from 'lucide-react';

interface SeatGridMapProps {
    seatSections?: Array<{ prefix: string; count: number }>;
    className?: string;
    title?: string;
    showHeader?: boolean;
    members: Array<any>;
    onPayDue?: (member: any) => void;
}

export default function SeatGridMap({
    seatSections = [],
    className = '',
    title,
    showHeader = true,
    members = [],
    onPayDue,
}: SeatGridMapProps) {
    const [hoveredSeat, setHoveredSeat] = useState<any | null>(null);
    const occupiedSeatsMap = new Map();
    members.forEach((member) => {
        occupiedSeatsMap.set(member.seatNumber, member);
    });
    if (!seatSections || seatSections.length === 0) {
        return (
            <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl ${className}`}>
                {showHeader && (
                    <div className="mb-4">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Seat Layout</p>
                        <h3 className="text-lg font-bold text-white">{title || 'Seat Layout & Capacity'}</h3>
                    </div>
                )}

                <div className="text-center py-12 text-slate-400 text-xs">No seat layout configured yet.</div>
            </div>
        );
    }

    return (
        <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl ${className}`}>
            {showHeader && (
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Total Capacity</p>
                        <h3 className="text-lg font-bold text-white">{title || 'Seat Layout & Capacity'}</h3>
                    </div>
                    <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-2 rounded-2xl text-xs font-bold">
                        {seatSections.reduce((acc, section) => acc + Number(section.count || 0), 0)} seats
                    </div>
                </div>
            )}

            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
                {seatSections.map((section) =>
                    Array.from({ length: section.count }, (_, i) => {
                        const seatLabel = `${section.prefix}${i + 1}`;
                        const occupant = occupiedSeatsMap.get(seatLabel);
                        const isOccupied = Boolean(occupant);
                        return (
                            <div
                                key={`${section.prefix}-${i + 1}`}
                                className={`relative p-3 rounded-2xl text-center border transition-all duration-200 ${
                                    isOccupied
                                        ? 'bg-gradient-to-b from-red-500/15 via-red-500/8 to-slate-950 border-red-400/70 shadow-[0_0_0_1px_rgba(248,113,113,0.3)] ring-2 ring-red-500/30'
                                        : 'bg-slate-950 border-slate-800 hover:border-emerald-500/40'
                                }`}
                                onMouseEnter={() => setHoveredSeat({ seatLabel, occupant })}
                                onMouseLeave={() => setHoveredSeat(null)}
                            >
                                <span className={`font-mono text-[10px] block mb-2 ${isOccupied ? 'text-red-300' : 'text-cyan-400'}`}>
                                    {seatLabel}
                                </span>
                                <Armchair
                                    className={`w-5 h-5 mx-auto mb-1 ${isOccupied ? 'text-red-300 drop-shadow-[0_0_8px_rgba(248,113,113,0.7)]' : 'text-slate-600'}`}
                                />
                                {isOccupied ? (
                                    <>
                                        <span className="inline-flex items-center justify-center rounded-full bg-red-500/15 border border-red-400/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-200 mb-1">
                                            Booked
                                        </span>
                                        <span className="block text-[10px] text-white font-bold truncate max-w-full px-1">
                                            {occupant.name}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                                        Available
                                    </span>
                                )}
                                {hoveredSeat?.seatLabel === seatLabel && isOccupied && (
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-slate-950 border border-slate-700 p-3.5 rounded-2xl shadow-2xl z-50 text-left pointer-events-none">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                                            <span className="text-xs font-bold text-white">{occupant.name}</span>
                                            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-semibold">
                                                Seat #{seatLabel}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5 text-[11px] text-slate-300">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-400 flex items-center space-x-1">
                                                    <Calendar className="w-3 h-3 mr-1 text-cyan-400" /> Plan:
                                                </span>
                                                <span className="font-medium text-white">{occupant.planName}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-400 flex items-center space-x-1">
                                                    <Phone className="w-3 h-3 mr-1 text-emerald-400" /> Mobile:
                                                </span>
                                                <span className="font-mono text-white">{occupant.mobile}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-400 flex items-center space-x-1">
                                                    <IndianRupee className="w-3 h-3 mr-1 text-amber-400" /> Due Balance:
                                                </span>
                                                <span className={`font-bold ${occupant.dueAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                    ₹{occupant.dueAmount || 0}
                                                </span>
                                            </div>

                                            <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-800/80 flex justify-between">
                                                <span>Expires:</span>
                                                <span className="font-semibold text-white">
                                                    {new Date(occupant.expiryDate).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {occupant.dueAmount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => onPayDue?.(occupant)}
                                                    className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] px-3 py-2 rounded-xl transition-all"
                                                >
                                                    Pay Due
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

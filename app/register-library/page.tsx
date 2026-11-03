'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/app/components/ToastProvider';
import {
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    Armchair,
    Clock,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    BookOpen,
    ShieldCheck
} from 'lucide-react';

export default function RegisterLibraryPage() {
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        ownerName: '',
        email: '',
        mobile: '',
        libraryName: '',
        address: '',
        city: '',
        totalSeats: 30,
        operatingHours: '6:00 AM – 10:00 PM',
        libraryPhotos: [] as File[], // <--- Added optional photos array
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/libraries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSubmitted(true);
                showToast({
                    type: 'success',
                    title: 'Library registration successful',
                    description: 'Your library is now onboarded and ready to manage members and seats.',
                });
            } else {
                showToast({
                    type: 'error',
                    title: 'Registration failed',
                    description: result.error || 'Failed to register library. Please try again.',
                });
            }
        } catch (err) {
            console.error('Submission error:', err);
            showToast({
                type: 'error',
                title: 'Network error',
                description: 'Something went wrong. Please check your network connection.',
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex flex-col justify-between">

            {/* HEADER */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 text-white p-2.5 rounded-xl shadow-md">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">GyaanSphere Space</h1>
                            <p className="text-xs text-slate-400">Library Partner Onboarding</p>
                        </div>
                    </Link>

                    <Link
                        href="/"
                        className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors flex items-center space-x-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                </div>
            </header>

            {/* MAIN CONTAINER */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full flex items-center justify-center">
                {!submitted ? (
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">

                        {/* Top Glow Accent */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 rounded-full blur-xs"></div>

                        <div className="text-center max-w-xl mx-auto mb-10">
                            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Expand Your Library Business</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-white">List Your Library on GyaanSphere</h2>
                            <p className="text-slate-400 text-sm mt-2">
                                Join our multi-tenant SaaS platform to automate seat layouts, track memberships, and collect student fees.
                            </p>
                        </div>

                        {/* STEP PROGRESS BAR */}
                        <div className="flex items-center justify-between max-w-md mx-auto mb-10 text-xs font-semibold">
                            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-cyan-400' : 'text-slate-600'}`}>
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center border ${step >= 1 ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-700 bg-slate-900'}`}>1</span>
                                <span>Owner Info</span>
                            </div>
                            <div className={`h-0.5 flex-1 mx-4 ${step >= 2 ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>
                            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-cyan-400' : 'text-slate-600'}`}>
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center border ${step >= 2 ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-700 bg-slate-900'}`}>2</span>
                                <span>Space Details</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* STEP 1: OWNER & CONTACT INFORMATION */}
                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
                                        <User className="w-5 h-5 text-cyan-400" />
                                        <span>Owner & Account Details</span>
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-2">Full Name</label>
                                            <div className="relative">
                                                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                                                <input
                                                    type="text"
                                                    name="ownerName"
                                                    required
                                                    value={formData.ownerName}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Ayush Jaiswal"
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-2">Mobile Number</label>
                                            <div className="relative">
                                                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                                                <input
                                                    type="tel"
                                                    name="mobile"
                                                    required
                                                    value={formData.mobile}
                                                    onChange={handleChange}
                                                    placeholder="+91 9079815256"
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-300 mb-2">Email Address</label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="ayush@gyaansphere.com"
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all flex items-center space-x-2"
                                        >
                                            <span>Next: Space Setup</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: LIBRARY & SEATING SETUP */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
                                        <Building2 className="w-5 h-5 text-cyan-400" />
                                        <span>Library & Seating Configuration</span>
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-300 mb-2">Library / Study Hall Name</label>
                                            <div className="relative">
                                                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                                                <input
                                                    type="text"
                                                    name="libraryName"
                                                    required
                                                    value={formData.libraryName}
                                                    onChange={handleChange}
                                                    placeholder="e.g. GyaanSphere Library - Branch 2"
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-2">City</label>
                                            <div className="relative">
                                                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                                                <input
                                                    type="text"
                                                    name="city"
                                                    required
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Raipur / Bhilai"
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-2">Total Seating Capacity</label>
                                            <div className="relative">
                                                <Armchair className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                                                <input
                                                    type="number"
                                                    name="totalSeats"
                                                    required
                                                    min="5"
                                                    max="500"
                                                    value={formData.totalSeats}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-300 mb-2">Full Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                required
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Complete Street Address, Near Landmark"
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                            />
                                        </div>

                                        <div className="sm:col-span-2 pt-2">
                                            <label className="block text-xs font-semibold text-slate-300 mb-2">
                                                Library Photos <span className="text-slate-500 font-normal">(Optional — Max 5 images)</span>
                                            </label>
                                            <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 text-center transition-colors bg-slate-900/50">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        if (e.target.files) {
                                                            setFormData({ ...formData, libraryPhotos: Array.from(e.target.files).slice(0, 5) });
                                                        }
                                                    }}
                                                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 file:cursor-pointer cursor-pointer"
                                                />
                                                <p className="text-[11px] text-slate-500 mt-2">Upload clean photos of your study desks, air conditioning, or entrance to attract students.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-between items-center">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                                        >
                                            Back to Step 1
                                        </button>

                                        <button
                                            type="submit"
                                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm px-8 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>Submit & Launch Library Space</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                    </div>
                ) : (
                    /* SUCCESS CONFIRMATION STATE */
                    <div className="w-full bg-slate-950 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                            Registration Received!
                        </h3>
                        <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed mb-6">
                            Welcome aboard, <strong className="text-cyan-400">{formData.ownerName}</strong>! Your library, <strong className="text-white">{formData.libraryName}</strong>, is now provisioned on <strong className="text-white">GyaanSphere Space</strong>.
                        </p>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-sm mx-auto text-left text-xs space-y-2 text-slate-300 mb-8">
                            <div>• Initial Seats Configured: <strong className="text-white">{formData.totalSeats} Seats</strong></div>
                            <div>• Location: <strong className="text-white">{formData.city}</strong></div>
                            <div>• Status: <span className="text-emerald-400 font-bold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Active Trial</span></div>
                        </div>

                        <Link
                            href="/dashboard/owner"
                            className="inline-flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all"
                        >
                            <span>Go to Owner Dashboard</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </main>

            {/* FOOTER */}
            <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
                © 2026 GyaanSphere Space. Multi-Tenant Library Management Platform.
            </footer>

        </div>
    );
}
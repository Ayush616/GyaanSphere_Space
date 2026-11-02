'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Building2, ShieldCheck, UserCheck } from 'lucide-react';

interface HeaderProps {
  onOpenLoginModal?: (role: 'owner' | 'staff') => void;
}

export default function Header({ onOpenLoginModal }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO & BRAND */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 text-white p-2.5 rounded-xl shadow-md group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-cyan-600 transition-colors">
              GyaanSphere Space
            </h1>
            <p className="text-xs text-slate-500">Multi-Library SaaS & Study Hubs</p>
          </div>
        </Link>
        
        {/* RIGHT NAVIGATION & ACTIONS */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          <Link 
            href="/gyaansphere-main"
            className="hidden lg:inline-block text-sm font-semibold text-slate-600 hover:text-cyan-600 transition-colors"
          >
            Main Branch
          </Link>

          {/* Owner Login Button */}
          <button
            onClick={() => onOpenLoginModal?.('owner')}
            className="hidden sm:flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl transition-all border border-slate-200"
            title="Ayush Jaiswal (Owner Access)"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Owner Login</span>
          </button>

          {/* Staff Login Button */}
          <button
            onClick={() => onOpenLoginModal?.('staff')}
            className="hidden sm:flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl transition-all border border-slate-200"
            title="Umesh Sahu (Receptionist / Staff Access)"
          >
            <UserCheck className="w-4 h-4 text-cyan-600" />
            <span>Staff Login</span>
          </button>

          {/* List Your Library SaaS CTA */}
          <Link 
            href="/register-library"
            className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center space-x-2"
          >
            <Building2 className="w-4 h-4" />
            <span>List Your Library</span>
          </Link>

        </div>

      </div>
    </header>
  );
}
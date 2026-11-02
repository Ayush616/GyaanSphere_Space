'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, BookOpen, Phone } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {

  return (
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Col 1: Brand Info */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center space-x-3">
                <div className="bg-cyan-500 text-slate-950 p-2 rounded-lg font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-white font-bold tracking-tight text-lg">GyaanSphere Space</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The ultimate multi-tenant platform for library and study hall automation. Empowering aspirants and management since 2026.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h5 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Platform Links</h5>
              <ul className="space-y-2.5 text-xs">
                <li><Link href="/" className="hover:text-cyan-400 transition-colors">SaaS Home</Link></li>
                <li><Link href="/register-library" className="hover:text-cyan-400 transition-colors">List Your Library</Link></li>
                <li><Link href="/gyaansphere-main" className="hover:text-cyan-400 transition-colors">Main Branch Portfolio</Link></li>
                <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Owner & Staff Login</Link></li>
              </ul>
            </div>

            {/* Col 3: Management & Support */}
            <div>
              <h5 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Leadership & Support</h5>
              <ul className="space-y-2.5 text-xs">
                <li>Management: <strong className="text-slate-200">Ayush Jaiswal</strong>[cite: 1]</li>
                <li>Receptionist: <strong className="text-slate-200">Umesh Sahu</strong>[cite: 1]</li>
                <li>Front Desk Assistance & Seat Allocations</li>
              </ul>
            </div>

            {/* Col 4: Contact & Helpline */}
            <div>
              <h5 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Helpline & WhatsApp</h5>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>+91 9079815256 / +91 7389043544</span>[cite: 2]
                </div>
                <p className="text-[11px] text-slate-500 pt-2">
                  Open Daily: 6:00 AM – 10:00 PM for all branch inquiries and fee support.
                </p>
              </div>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <div>
              © 2026 GyaanSphere Space. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Security</span>
            </div>
          </div>
        </div>
      </footer>
  );
}
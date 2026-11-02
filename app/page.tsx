'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Users, Laptop } from 'lucide-react';
import Footer from './components/Footer';
import Header from './components/Header';
import HeroCarousel from './components/Carousel';

export default function SaaSPlatformHome() {
  // Animated Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselSlides = [
    {
      title: "Smart Seat Grid Layout",
      subtitle: "Visual Management",
      desc: "Instantly track seat availability, check member allocations, and manage capacity in real-time with our interactive grid matrix.",
      badge: "Feature #1",
      bgGradient: "from-blue-900 via-indigo-900 to-slate-900"
    },
    {
      title: "Automated Expiry & Memberships",
      subtitle: "Zero Hassle Tracking",
      desc: "Seamlessly log Aadhaar IDs, mobile numbers, and custom subscription durations (Monthly, Quarterly, Half-Yearly) with automatic status flags.",
      badge: "Feature #2",
      bgGradient: "from-slate-900 via-cyan-950 to-blue-950"
    },
    {
      title: "Multi-Tenant Library SaaS",
      subtitle: "Scale Your Brand",
      desc: "Designed for multiple library owners to register, list their study spaces, and handle administrative staff access effortlessly.",
      badge: "SaaS Ready",
      bgGradient: "from-indigo-950 via-slate-900 to-cyan-900"
    }
  ];

  // Auto advance carousel every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-500 selection:text-white flex flex-col justify-between">

      <div>
        {/* NAVBAR */}
        <Header />



        {/* UNIQUE DYNAMIC ANIMATED CAROUSEL CARD */}
        <HeroCarousel />



        {/* CORE PLATFORM FEATURES */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-2">Built for Scale</h3>
              <h4 className="text-3xl font-bold text-slate-900">Everything Your Study Space Needs</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="bg-cyan-100 text-cyan-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <Laptop className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-bold text-slate-900 mb-2">Visual Seat Grid Layout</h5>
                <p className="text-slate-600 text-sm">Design your room layout, track occupied vs. vacant seats instantly, and assign members with one click.</p>
              </div>

              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-bold text-slate-900 mb-2">Membership & Expiry Tracking</h5>
                <p className="text-slate-600 text-sm">Automated tracking of member Aadhaar details, mobile numbers, plan validity, and payment statuses.</p>
              </div>

              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-bold text-slate-900 mb-2">Staff & Owner Roles</h5>
                <p className="text-slate-600 text-sm">Assign administrative privileges to front-desk receptionists (like Umesh Sahu) while retaining owner controls[cite: 1].</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />

    </div>
  );
}
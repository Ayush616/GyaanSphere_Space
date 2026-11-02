'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const carouselSlides = [
    {
      title: "Smart Seat Grid Layout",
      subtitle: "Visual Management",
      desc: "Instantly track seat availability, check member allocations, and manage capacity in real-time with our interactive grid matrix.",
      badge: "Feature #1",
    },
    {
      title: "Automated Expiry & Memberships",
      subtitle: "Zero Hassle Tracking",
      desc: "Seamlessly log Aadhaar IDs, mobile numbers, and custom subscription durations (Monthly, Quarterly, Half-Yearly) with automatic status flags.",
      badge: "Feature #2",
    },
    {
      title: "Multi-Tenant Library SaaS",
      subtitle: "Scale Your Brand",
      desc: "Designed for multiple library owners to register, list their study spaces, and handle administrative staff access effortlessly.",
      badge: "SaaS Ready",
    }
  ];

  // Auto advance carousel every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  // Background Interactive Cursor-Tracking Connecting Dots & Curves Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates tracking relative to canvas container
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const parentCard = canvas.parentElement;
    parentCard?.addEventListener('mousemove', handleMouseMove);
    parentCard?.addEventListener('mouseleave', handleMouseLeave);

    // Generate static nodes/dots for connection grid
    const dotsCount = 35;
    const dots: { x: number; y: number; vx: number; vy: number }[] = [];
    for (let i = 0; i < dotsCount; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
      });
    }

    const render = () => {
      // Smooth easing for mouse movement
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      ctx.clearRect(0, 0, width, height);

      // Update and draw dots & connecting curves
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';

      dots.forEach((dot, index) => {
        // Move dots slightly
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Connect dots to each other if close
        for (let j = index + 1; j < dots.length; j++) {
          const other = dots[j];
          const dx = dot.x - other.x;
          const dy = dot.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Connect dots to cursor if close (Interactive hover effect)
        const mdx = dot.x - mouse.x;
        const mdy = dot.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < 140) {
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(34, 211, 238, ${1 - mdist / 140})`;
          ctx.stroke();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)'; // reset
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      parentCard?.removeEventListener('mousemove', handleMouseMove);
      parentCard?.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const slide = carouselSlides[currentSlide];

  return (
    <section className="relative overflow-hidden pt-16 pb-24 bg-slate-900 text-white">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Library Management System</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Empower Your Library with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Smart Automation</span>
          </h2>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            The all-in-one SaaS platform built for modern study halls to manage members, visual seat layouts, and digital fee collections effortlessly.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-700 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden min-h-[280px] flex flex-col justify-between">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full z-0 pointer-events-auto"
            />

            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {slide.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  0{currentSlide + 1} / 0{carouselSlides.length}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {slide.title}
              </h3>
              <h4 className="text-cyan-400 font-medium text-sm mb-4">
                {slide.subtitle}
              </h4>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                {slide.desc}
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-8 pt-6 border-t border-slate-700/60">
              <div className="flex space-x-2">
                {carouselSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === idx ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-600 hover:bg-slate-500'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1))}
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)}
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/register-library"
            className="inline-flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg transition-all"
          >
            <span>Get Started for Your Library</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
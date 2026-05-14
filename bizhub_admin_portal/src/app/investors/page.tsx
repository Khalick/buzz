"use client";
import React, { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, Database, Globe2, Lock, ShieldCheck, Smartphone, Target, Zap } from 'lucide-react';

export default function InvestorPitchPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050B0A] text-white font-sans overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">
      {/* Custom Styles for Interactions & Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatSlow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.1); }
          50% { box-shadow: 0 0 80px rgba(212, 175, 55, 0.3); }
          100% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.1); }
        }
        .animate-fade-up {
          animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animate-float {
          animation: floatSlow 6s ease-in-out infinite;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .glass-panel {
          background: rgba(27, 67, 50, 0.3);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.15);
        }
        .text-gradient {
          background: linear-gradient(135deg, #FFF 0%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        /* Glowing Orbs */
        .orb-1 { position: absolute; top: -10%; left: -5%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(27,67,50,0.4) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; filter: blur(60px); z-index: 0; pointer-events: none; }
        .orb-2 { position: absolute; bottom: 20%; right: -10%; width: 60vw; height: 60vw; background: radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; filter: blur(80px); z-index: 0; pointer-events: none; }
      `}} />

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="orb-1"></div>
        <div className="orb-2"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        
        {/* HERO SECTION */}
        <header className="min-h-[80vh] flex flex-col justify-center items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] font-medium text-sm mb-8 animate-fade-up">
            <Globe2 size={16} /> Seed Round Deck 2026
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 animate-fade-up delay-100" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="text-white">Biz</span><span className="text-gradient">Hub</span>
          </h1>
          <p className="text-2xl md:text-3xl font-light text-[#E0E0E0] max-w-4xl leading-relaxed mb-12 animate-fade-up delay-200">
            The AI-Powered Commerce Fabric formalizing Africa's $300B Invisible Economy.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 animate-fade-up delay-300">
            <button className="px-8 py-4 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]">
              View Financials
            </button>
            <button className="px-8 py-4 glass-panel text-white font-medium rounded-xl hover:bg-[#1B4332]/50 transition-all">
              Try Interactive Demo
            </button>
          </div>
        </header>

        {/* SECTION 1: THE PROBLEM & OPPORTUNITY (TAM) */}
        <section className="py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-up">
              <h2 className="text-4xl font-bold text-gradient">The $300B Trust Deficit</h2>
              <p className="text-lg text-[#E0E0E0]/80 leading-relaxed">
                Across emerging markets, particularly East Africa, local commerce operates in the shadows. Independent service providers and gig workers have incredible talent but lack visibility. Consumers struggle to find verified, trustworthy mechanics, plumbers, and local enterprises.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="glass-panel p-6 rounded-2xl border-l-[3px] border-l-red-500/50">
                  <h3 className="text-3xl font-bold text-white mb-2">90%</h3>
                  <p className="text-sm text-white/50">Of transactions remain informal and untracked</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl border-l-[3px] border-l-[#D4AF37]/50">
                  <h3 className="text-3xl font-bold text-white mb-2">$15B+</h3>
                  <p className="text-sm text-white/50">Total Addressable Market in Kenya Alone</p>
                </div>
              </div>
            </div>
            <div className="relative animate-float delay-100">
               <img src="/bizhub_marketplace_ai.png" alt="AI Marketplace Map" className="w-full rounded-2xl shadow-2xl glass-panel p-2 object-cover" />
            </div>
          </div>
        </section>

        {/* SECTION 2: THE SMART BROADCAST ENGINE */}
        <section className="py-24 relative">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-up">
            <h2 className="text-5xl font-bold text-gradient mb-6">The Smart Broadcast Algorithm</h2>
            <p className="text-xl text-[#E0E0E0]/80">Instead of users endlessly scrolling, they issue Intent Broadcasts. AI matches natural language requests with hyper-local vendors who bid instantly.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative animate-float">
               <img src="/bizhub_smart_broadcast.png" alt="Smart Broadcast Interface" className="w-full rounded-2xl shadow-[0_0_40px_rgba(27,67,50,0.4)] border border-[#1B4332] p-1 object-cover" />
            </div>
            <div className="order-1 md:order-2 space-y-12 animate-fade-up delay-200">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-[#1B4332] flex items-center justify-center shrink-0">
                  <Smartphone className="text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Intent-Driven Bidding</h3>
                  <p className="text-[#E0E0E0]/70">Customers ask for what they need using Voice or Text via our Claude-powered Chatbot. Validated merchants receive automated push notifications.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-[#1B4332] flex items-center justify-center shrink-0">
                  <Target className="text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Hyper-Local Map Tuning</h3>
                  <p className="text-[#E0E0E0]/70">Bypasses missing African street addresses via intelligent GPS clustering algorithms directly integrated into the dashboard.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-[#1B4332] flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Zero-Trust 'Blue Check'</h3>
                  <p className="text-[#E0E0E0]/70">Mandatory KYC using KRA PINs and National ID verification creates an ironclad ecosystem of trusted vendors.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: THE FINANCIAL MOAT */}
        <section className="py-24">
          <div className="glass-panel rounded-[40px] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1B4332]/40 to-transparent"></div>
            
            <div className="grid md:grid-cols-2 gap-16 relative z-10 items-center">
              <div className="space-y-8 animate-fade-up">
                <h2 className="text-4xl font-bold text-white">The Financial Data Moat</h2>
                <p className="text-lg text-[#E0E0E0]/80">
                  BizHub doesn't just connect—it processes. With frictionless M-Pesa integration for consumers and automated Corporate Invoicing for B2B gig services, we act as the central ledger for a previously invisible economy.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-center gap-3 text-white/90"><Database size={18} className="text-[#D4AF37]" /> Proprietary Credit Scoring Data</li>
                  <li className="flex items-center gap-3 text-white/90"><ArrowRight size={18} className="text-[#D4AF37]" /> 0% Fraud Gateway via Edge Functions</li>
                  <li className="flex items-center gap-3 text-white/90"><Zap size={18} className="text-[#D4AF37]" /> Corporate Escrow & Automated Invoicing</li>
                </ul>
              </div>
              <div className="animate-float delay-300">
                <img src="/bizhub_financial_moat.png" alt="Financial Moat" className="w-full rounded-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: ENTERPRISE INFRASTRUCTURE */}
        <section className="py-24 text-center">
          <h2 className="text-4xl font-bold text-gradient mb-16 animate-fade-up">Enterprise-Grade Infrastructure</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Edge Architecture", desc: "Powered by Supabase and Next.js, scaling effortlessly to millions of concurrent requests with ultra-low latency.", icon: <Database /> },
              { title: "Row-Level Security", desc: "Military-grade data siloing natively within PostgreSQL preventing unauthorized data leakage.", icon: <Lock /> },
              { title: "AI Moderation", desc: "Automated 'Proof of Visit' flagging and fraud detection processing images directly at the edge.", icon: <ShieldCheck /> }
            ].map((f, i) => (
              <div key={i} className={`glass-panel p-10 rounded-2xl hover:-translate-y-2 transition-all duration-300 animate-fade-up hover:bg-[#1B4332]/40`} style={{ animationDelay: \`\${i * 150}ms\` }}>
                 <div className="w-14 h-14 bg-black/40 rounded-xl flex items-center justify-center mb-6 text-[#D4AF37] border border-white/5 mx-auto">
                    {f.icon}
                 </div>
                 <h3 className="text-xl font-bold text-white mb-4">{f.title}</h3>
                 <p className="text-sm text-[#E0E0E0]/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA FOOTER */}
        <footer className="mt-20 border-t border-white/10 pt-20 pb-10 text-center animate-fade-up">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Ready to define the future?</h2>
          <div className="flex justify-center items-center gap-4">
             <button className="px-10 py-5 bg-[#D4AF37] text-black text-lg font-bold rounded-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)]">
               Contact Fund Managers
             </button>
          </div>
          <p className="text-white/40 mt-12 text-sm">© 2026 BizHub Technologies Inc. Confidential Investment Documentation.</p>
        </footer>

      </div>
    </div>
  );
}

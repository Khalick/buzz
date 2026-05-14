#!/bin/bash
OUTPUT_FILE="/home/peter/buzz/bizhub_investors_detailed.html"

# Encode images
IMG1=$(base64 -w 0 /home/peter/buzz/bizhub_admin_portal/public/bizhub_marketplace_ai.png)
IMG2=$(base64 -w 0 /home/peter/buzz/bizhub_admin_portal/public/bizhub_smart_broadcast.png)
IMG3=$(base64 -w 0 /home/peter/buzz/bizhub_admin_portal/public/bizhub_financial_moat.png)

cat <<HTML > $OUTPUT_FILE
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BizHub | Comprehensive Investor Prospectus 2026</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Outfit', sans-serif; background-color: #050B0A; color: #FFF; overflow-x: hidden; scroll-behavior: smooth; }
    ::selection { background: #D4AF37; color: #000; }
    
    @keyframes fadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes floatSlow { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
    @keyframes pulseSoft { 0% { opacity: 0.8; } 50% { opacity: 0.4; } 100% { opacity: 0.8; } }
    
    .animate-fade-up { animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
    .animate-float { animation: floatSlow 7s ease-in-out infinite; }
    
    .delay-100 { animation-delay: 100ms; } .delay-200 { animation-delay: 200ms; } .delay-300 { animation-delay: 300ms; } .delay-400 { animation-delay: 400ms; }
    
    .glass-panel { background: rgba(27, 67, 50, 0.2); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(212, 175, 55, 0.15); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); }
    .glass-card { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; transition: all 0.4s ease; }
    .glass-card:hover { transform: translateY(-5px); border-color: rgba(212, 175, 55, 0.3); background: rgba(27, 67, 50, 0.4); }
    
    .text-gradient { background: linear-gradient(135deg, #FFFFFF 0%, #D4AF37 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    
    .orb-1 { position: absolute; top: -10%; left: -5%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(27,67,50,0.6) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; filter: blur(60px); z-index: -1; pointer-events: none; }
    .orb-2 { position: absolute; top: 40%; right: -20%; width: 60vw; height: 60vw; background: radial-gradient(circle, rgba(212,175,55,0.06) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; filter: blur(90px); z-index: -1; pointer-events: none; }
    .orb-3 { position: absolute; bottom: 0; left: 20%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(27,67,50,0.4) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; filter: blur(80px); z-index: -1; pointer-events: none; }
    
    .feature-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.2); display: flex; align-items: center; justify-content: center; color: #D4AF37; margin-bottom: 20px; font-weight: bold; font-size: 20px; }
  </style>
</head>
<body class="relative min-h-screen">
  <div class="orb-1"></div><div class="orb-2"></div><div class="orb-3"></div>

  <main class="relative z-10 max-w-7xl mx-auto px-6 py-20 pb-32">
    
    <!-- HEADER -->
    <header class="min-h-[90vh] flex flex-col justify-center items-center text-center">
      <div class="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] font-semibold text-sm mb-8 animate-fade-up tracking-widest uppercase">
        Comprehensive Technical Prospectus
      </div>
      <h1 class="text-6xl md:text-8xl font-black tracking-tight mb-8 animate-fade-up delay-100">
        <span class="text-white">The Operating System for</span> <br/><span class="text-gradient">African Commerce.</span>
      </h1>
      <p class="text-xl md:text-3xl font-light text-[#E0E0E0] max-w-4xl leading-relaxed mb-16 animate-fade-up delay-200">
        BizHub is a Zero-Trust, AI-powered Super App bridging the $300B informal gig economy and B2B enterprise sectors across emerging markets.
      </p>
      <div class="flex flex-col sm:flex-row gap-6 animate-fade-up delay-300 w-full sm:w-auto">
        <a href="#problem" class="px-10 py-5 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_40px_rgba(212,175,55,0.3)] w-full text-lg">
          Read Executive Summary
        </a>
      </div>
    </header>

    <!-- THE PROBLEM & TAM -->
    <section id="problem" class="py-24 border-t border-white/5">
      <div class="grid md:grid-cols-2 gap-16 items-center">
        <div class="space-y-8 animate-fade-up">
          <h2 class="text-4xl md:text-5xl font-black text-white">The African Trust Deficit</h2>
          <p class="text-xl text-[#E0E0E0]/80 leading-relaxed font-light">
            In Kenya and across Sub-Saharan Africa, 90% of commerce remains informal. Consumers desperately need verified tradespeople (mechanics, plumbers, designers), but the market is heavily fragmented by WhatsApp groups and word-of-mouth. There is no unified system of trust, no financial transparency, and no centralized data moat.
          </p>
          <div class="grid grid-cols-2 gap-6 pt-6">
            <div class="glass-panel p-8 rounded-2xl border-l-[4px] border-l-red-500/50">
              <h3 class="text-5xl font-black text-white mb-3">90%</h3>
              <p class="text-sm text-white/50 uppercase tracking-widest font-bold">Informal Sector</p>
            </div>
            <div class="glass-panel p-8 rounded-2xl border-l-[4px] border-l-[#D4AF37]/50">
              <h3 class="text-5xl font-black text-white mb-3">$15B+</h3>
              <p class="text-sm text-white/50 uppercase tracking-widest font-bold">Kenya Digital Services TAM</p>
            </div>
          </div>
        </div>
        <div class="relative animate-float delay-100">
           <img src="data:image/png;base64,${IMG1}" alt="AI Marketplace Map" class="w-full rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5 object-cover" />
        </div>
      </div>
    </section>

    <!-- CORE FEATURE: SMART BROADCAST -->
    <section class="py-24 relative">
      <div class="max-w-4xl mx-auto text-center mb-24 animate-fade-up">
        <h2 class="text-5xl font-black text-gradient mb-8">The Smart Broadcast Engine</h2>
        <p class="text-2xl text-[#E0E0E0]/80 font-light">Endless scroll is dead. We inverted the marketplace model. Users broadcast intent; merchants bid for the business.</p>
      </div>
      
      <div class="grid md:grid-cols-2 gap-16 items-center">
        <div class="order-2 md:order-1 relative animate-float">
           <img src="data:image/png;base64,${IMG2}" alt="Smart Broadcast Interface" class="w-full rounded-[2rem] shadow-[0_0_80px_rgba(27,67,50,0.4)] border border-[#1B4332] p-1 object-cover" />
           <div class="absolute -right-6 top-10 glass-panel p-4 rounded-xl max-w-[200px] animate-fade-up delay-200">
             <p class="text-xs text-[#D4AF37] font-bold mb-1">AI MATCHING</p>
             <p class="text-sm font-light">"I need a plumber in Westlands in 30 mins."</p>
           </div>
        </div>
        <div class="order-1 md:order-2 space-y-8 animate-fade-up delay-100">
          <div class="glass-card p-8">
            <h3 class="text-2xl font-bold text-white mb-3">Claude API Intent Parsing</h3>
            <p class="text-lg text-[#E0E0E0]/70 font-light">Customers speak or type their needs naturally into the AskBizHub chatbot. AI native routing translates the intent into structural service parameters instantly.</p>
          </div>
          <div class="glass-card p-8">
            <h3 class="text-2xl font-bold text-white mb-3">Instant Push Bidding</h3>
            <p class="text-lg text-[#E0E0E0]/70 font-light">Verified merchants within the geofenced operational radius receive Push Broadcasts on their dashboard. They submit instant quotes, forcing a competitive clearing price.</p>
          </div>
          <div class="glass-card p-8">
            <h3 class="text-2xl font-bold text-white mb-3">Hyper-Local Map Search Tuning</h3>
            <p class="text-lg text-[#E0E0E0]/70 font-light">African street addressing is notoriously tricky. Our proprietary Search Tuning engine allows admins to strictly map unstructured slang terms to exact GPS coordinates (e.g., mapping "Dumpsite lane" to a strict latitude/longitude boundary).</p>
          </div>
        </div>
      </div>
    </section>

    <!-- EXHAUSTIVE FEATURE SET -->
    <section class="py-32">
      <div class="text-center mb-20 animate-fade-up">
        <h2 class="text-5xl font-black text-white mb-6">The Unified Super App Ecosystem</h2>
        <p class="text-xl text-[#E0E0E0]/60 max-w-3xl mx-auto font-light">We did not build an app; we built an ecosystem. Every feature is interlocked to trap data and maximize marketplace liquidity.</p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Feature cards -->
        <div class="glass-card p-10 animate-fade-up delay-100">
          <div class="feature-icon">🛡️</div>
          <h3 class="text-xl font-bold text-white mb-4">Proof of Visit Moderation</h3>
          <p class="text-[#E0E0E0]/70 font-light leading-relaxed">Mandated geospatial and photographic proof for services rendered. Evaluated by Admins via the visual queue before payments are released for high-risk jobs.</p>
        </div>
        <div class="glass-card p-10 animate-fade-up delay-200">
          <div class="feature-icon">🏢</div>
          <h3 class="text-xl font-bold text-white mb-4">Franchise Groups (B2B)</h3>
          <p class="text-[#E0E0E0]/70 font-light leading-relaxed">Enterprise tier controlling multiple master-branches under one umbrella. Chain businesses manage sub-merchants from a centralized cockpit.</p>
        </div>
        <div class="glass-card p-10 animate-fade-up delay-300">
          <div class="feature-icon">🌍</div>
          <h3 class="text-xl font-bold text-white mb-4">Field Agent Onboarding</h3>
          <p class="text-[#E0E0E0]/70 font-light leading-relaxed">An integrated commission structure for boots-on-the-ground agents sourcing legacy offline merchants onto the BizHub digital rails.</p>
        </div>
        <div class="glass-card p-10 animate-fade-up delay-100">
          <div class="feature-icon">🎁</div>
          <h3 class="text-xl font-bold text-white mb-4">Smart Promotions</h3>
          <p class="text-[#E0E0E0]/70 font-light leading-relaxed">Algorithmic voucher generation to stimulate demand in specific ZIP codes or during low-liquidity hours in the marketplace.</p>
        </div>
        <div class="glass-card p-10 animate-fade-up delay-200">
          <div class="feature-icon">📢</div>
          <h3 class="text-xl font-bold text-white mb-4">Ad Campaigns (Placements)</h3>
          <p class="text-[#E0E0E0]/70 font-light leading-relaxed">Merchants bid for premium 'Featured' real estate slots via automated digital ad injection in the customer feeds.</p>
        </div>
        <div class="glass-card p-10 animate-fade-up delay-300">
          <div class="feature-icon">🎧</div>
          <h3 class="text-xl font-bold text-white mb-4">Support CRM</h3>
          <p class="text-[#E0E0E0]/70 font-light leading-relaxed">A lightweight, integrated helpdesk allowing administrators to mediate disputes, view transaction logs, and freeze accounts natively.</p>
        </div>
      </div>
    </section>

    <!-- THE FINTECH MOAT -->
    <section class="py-24">
      <div class="glass-panel rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-2/3 h-full bg-gradient-to-r from-[#1B4332]/60 to-transparent z-0"></div>
        
        <div class="grid md:grid-cols-2 gap-16 relative z-10 items-center">
          <div class="animate-float">
            <img src="data:image/png;base64,${IMG3}" alt="Financial Moat" class="w-full rounded-[2rem] drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[#D4AF37]/20" />
          </div>
          <div class="space-y-8 animate-fade-up delay-200">
            <h2 class="text-4xl md:text-5xl font-black text-white">The Financial Data Moat</h2>
            <p class="text-xl text-[#E0E0E0]/90 font-light leading-relaxed">
              BizHub acts as the central ledger for a previously invisible economy. By deeply integrating robust financial rails underneath the service marketplace, we extract unassailable proprietary data.
            </p>
            <div class="pt-6 space-y-8">
              <div>
                <h4 class="text-2xl font-bold text-[#D4AF37] mb-2">Frictionless M-Pesa Native API</h4>
                <p class="text-[#E0E0E0]/70 font-light">Direct integration with Safaricom Daraja handles B2C micropayments with zero user drop-off.</p>
              </div>
              <div>
                <h4 class="text-2xl font-bold text-[#D4AF37] mb-2">Corporate B2B Invoicing</h4>
                <p class="text-[#E0E0E0]/70 font-light">Enterprise procurement teams bypass M-Pesa bottlenecks by generating automated PDF Corporate Invoices and paying out gig workers via escrow batched funds.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ZERO TRUST SECURITY ARCHITECTURE -->
    <section class="py-32">
      <div class="text-center mb-24 animate-fade-up">
        <h2 class="text-5xl font-black text-gradient mb-6">Zero-Trust Security Architecture</h2>
        <p class="text-2xl text-[#E0E0E0]/70 max-w-3xl mx-auto font-light">Built on Defense-in-Depth principles. The entire platform assumes the network is compromised, enforcing rigorous validation at every edge.</p>
      </div>

      <div class="grid md:grid-cols-2 gap-12">
        <div class="glass-card p-12 border-l-[4px] border-l-[#D4AF37]">
          <h3 class="text-3xl font-black text-white mb-6">Database Row-Level Security (RLS)</h3>
          <p class="text-[#E0E0E0]/70 text-lg font-light leading-relaxed">
            Data access control is not handled in the API layer—it is hardcoded directly into the deepest layer of the Postgres engine. Users physically cannot query rows they do not own, eliminating IDOR vulnerabilities at the absolute root. Complex subquery bypass prevention ensures no infinite recursion occurs during massive admin payloads.
          </p>
        </div>
        <div class="glass-card p-12 border-l-[4px] border-l-[#D4AF37]">
          <h3 class="text-3xl font-black text-white mb-6">Immutable Audit Logging Triggers</h3>
          <p class="text-[#E0E0E0]/70 text-lg font-light leading-relaxed">
            Every critical action (role elevation, merchant verification, campaign edits) fires an undetectable background PostgreSQL Trigger function. The action, user ID, and JSONB diff of the alteration are irrevocably written to an isolated `security_audit_log` Table managed only by superusers.
          </p>
        </div>
        <div class="glass-card p-12 border-l-[4px] border-l-[#D4AF37]">
          <h3 class="text-3xl font-black text-white mb-6">Strict Zod Schema Serialization</h3>
          <p class="text-[#E0E0E0]/70 text-lg font-light leading-relaxed">
            All user inputs across the web and mobile platforms are violently type-checked using Zod schemas before runtime parsing. Unsanitized SQL injections or malformed XSS payloads are completely neutralized during React state lifecycle execution.
          </p>
        </div>
        <div class="glass-card p-12 border-l-[4px] border-l-[#D4AF37]">
          <h3 class="text-3xl font-black text-white mb-6">KRA PIN Identity Validation</h3>
          <p class="text-[#E0E0E0]/70 text-lg font-light leading-relaxed">
            Eliminates gig economy fraud. The "Blue Checkmark" is only awarded to physical entities that clear a multi-factor KYC review including National ID and KRA PIN scraping. Verified merchants mathematically dominate the intent-bidding market.
          </p>
        </div>
      </div>
    </section>

    <!-- CONCLUSION -->
    <footer class="mt-10 border-t border-white/10 pt-32 pb-16 text-center animate-fade-up">
      <h2 class="text-5xl md:text-7xl font-black text-white mb-10">Invest in the Commerce Layer.</h2>
      <button class="px-16 py-6 bg-[#D4AF37] text-black text-xl font-black rounded-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_60px_rgba(212,175,55,0.4)] tracking-wide">
        CONTACT THE FOUNDERS
      </button>
      <div class="mt-20 pt-10 border-t border-white/5 text-[#E0E0E0]/30 text-sm tracking-widest font-bold">
        © 2026 BIZHUB TECHNOLOGIES INC. — CONFIDENTIAL INVESTMENT DATA
      </div>
    </footer>

  </main>
</body>
</html>
HTML

echo "Successfully wrote $OUTPUT_FILE"

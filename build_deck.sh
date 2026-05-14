#!/bin/bash
OUTPUT_FILE="/home/peter/buzz/bizhub_investors.html"

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
  <title>BizHub | Investor Pitch 2026</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Outfit', sans-serif; background-color: #050B0A; color: #FFF; overflow-x: hidden; scroll-behavior: smooth; }
    ::selection { background: #D4AF37; color: #000; }
    
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes floatSlow {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
      100% { transform: translateY(0px); }
    }
    
    .animate-fade-up {
      animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }
    .animate-float {
      animation: floatSlow 6s ease-in-out infinite;
    }
    .delay-100 { animation-delay: 100ms; }
    .delay-200 { animation-delay: 200ms; }
    .delay-300 { animation-delay: 300ms; }
    
    .glass-panel {
      background: rgba(27, 67, 50, 0.3);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(212, 175, 55, 0.15);
    }
    .text-gradient {
      background: linear-gradient(135deg, #FFFFFF 0%, #D4AF37 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .orb-1 { position: absolute; top: -10%; left: -5%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(27,67,50,0.5) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; filter: blur(60px); z-index: -1; pointer-events: none; }
    .orb-2 { position: absolute; bottom: 20%; right: -10%; width: 60vw; height: 60vw; background: radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; filter: blur(80px); z-index: -1; pointer-events: none; }
  </style>
</head>
<body class="relative min-h-screen">
  <div class="orb-1"></div>
  <div class="orb-2"></div>

  <main class="relative z-10 max-w-7xl mx-auto px-6 py-20 pb-32">
    
    <!-- HEADER -->
    <header class="min-h-[85vh] flex flex-col justify-center items-center text-center">
      <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] font-medium text-sm mb-8 animate-fade-up">
        Seed Round Deck 2026
      </div>
      <h1 class="text-6xl md:text-8xl font-black tracking-tight mb-8 animate-fade-up delay-100">
        <span class="text-white">Biz</span><span class="text-gradient">Hub</span>
      </h1>
      <p class="text-2xl md:text-3xl font-light text-[#E0E0E0] max-w-4xl leading-relaxed mb-12 animate-fade-up delay-200">
        The AI-Powered Commerce Fabric formalizing Africa's $300B Invisible Economy.
      </p>
      <div class="flex flex-col sm:flex-row gap-6 animate-fade-up delay-300">
        <a href="#market" class="px-8 py-4 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]">
          Explore the Deck
        </a>
      </div>
    </header>

    <!-- SECTION 1: PROBLEM -->
    <section id="market" class="py-32">
      <div class="grid md:grid-cols-2 gap-16 items-center">
        <div class="space-y-8 animate-fade-up">
          <h2 class="text-4xl md:text-5xl font-bold text-gradient">The $300B Trust Deficit</h2>
          <p class="text-xl text-[#E0E0E0]/80 leading-relaxed font-light">
            Across emerging markets, particularly East Africa, local commerce operates in the shadows. Independent service providers and gig workers have incredible talent but lack visibility. Consumers struggle to find verified, trustworthy mechanics, plumbers, and local enterprises.
          </p>
          <div class="grid grid-cols-2 gap-6 pt-4">
            <div class="glass-panel p-6 rounded-2xl border-l-[3px] border-l-red-500/50">
              <h3 class="text-4xl font-black text-white mb-2">90%</h3>
              <p class="text-sm text-white/50 uppercase tracking-widest font-bold">Informal Market</p>
            </div>
            <div class="glass-panel p-6 rounded-2xl border-l-[3px] border-l-[#D4AF37]/50">
              <h3 class="text-4xl font-black text-white mb-2">$15B+</h3>
              <p class="text-sm text-white/50 uppercase tracking-widest font-bold">Addressable Market</p>
            </div>
          </div>
        </div>
        <div class="relative animate-float delay-100">
           <img src="data:image/png;base64,${IMG1}" alt="AI Marketplace Map" class="w-full rounded-2xl shadow-2xl glass-panel p-2 object-cover" />
        </div>
      </div>
    </section>

    <!-- SECTION 2: SMART BROADCAST -->
    <section class="py-32 relative">
      <div class="max-w-4xl mx-auto text-center mb-24 animate-fade-up">
        <h2 class="text-5xl font-bold text-gradient mb-6">The Smart Broadcast Algorithm</h2>
        <p class="text-2xl text-[#E0E0E0]/80 font-light">Instead of users endlessly scrolling, they issue Intent Broadcasts. AI matches natural language requests with hyper-local vendors who bid instantly.</p>
      </div>
      
      <div class="grid md:grid-cols-2 gap-16 items-center">
        <div class="order-2 md:order-1 relative animate-float">
           <img src="data:image/png;base64,${IMG2}" alt="Smart Broadcast Interface" class="w-full rounded-2xl shadow-[0_0_50px_rgba(27,67,50,0.4)] border border-[#1B4332] p-1 object-cover" />
        </div>
        <div class="order-1 md:order-2 space-y-12 animate-fade-up delay-200">
          <div class="flex gap-6">
            <div class="w-14 h-14 rounded-full bg-[#1B4332] flex items-center justify-center shrink-0 border border-[#D4AF37]/20 text-[#D4AF37] font-bold text-xl">
              1
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white mb-2">Intent-Driven Bidding</h3>
              <p class="text-lg text-[#E0E0E0]/70 font-light">Customers ask for what they need using Voice or Text via our Claude API Chatbot. Validated merchants receive automated push notifications.</p>
            </div>
          </div>
          <div class="flex gap-6">
            <div class="w-14 h-14 rounded-full bg-[#1B4332] flex items-center justify-center shrink-0 border border-[#D4AF37]/20 text-[#D4AF37] font-bold text-xl">
              2
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white mb-2">Hyper-Local Map Tuning</h3>
              <p class="text-lg text-[#E0E0E0]/70 font-light">Bypasses missing African street addresses via intelligent geospatial clustering algorithms natively managed via the Admin Portal.</p>
            </div>
          </div>
          <div class="flex gap-6">
            <div class="w-14 h-14 rounded-full bg-[#1B4332] flex items-center justify-center shrink-0 border border-[#D4AF37]/20 text-[#D4AF37] font-bold text-xl">
              3
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white mb-2">Zero-Trust 'Blue Check'</h3>
              <p class="text-lg text-[#E0E0E0]/70 font-light">Mandatory KYC using KRA PINs and National ID verification creates an ironclad ecosystem of trusted vendors.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 3: FINTECH MOAT -->
    <section class="py-32">
      <div class="glass-panel rounded-[40px] p-12 md:p-24 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1B4332]/40 to-transparent z-0"></div>
        
        <div class="grid md:grid-cols-2 gap-16 relative z-10 items-center">
          <div class="space-y-8 animate-fade-up">
            <h2 class="text-4xl md:text-5xl font-bold text-white">The Financial Data Moat</h2>
            <p class="text-xl text-[#E0E0E0]/80 font-light">
              BizHub doesn't just connect—it processes. With frictionless M-Pesa API hooks for consumers and automated Corporate Invoicing for B2B gig services, we act as the central ledger for a previously invisible economy.
            </p>
            <div class="pt-6 space-y-6">
              <div class="flex items-center gap-4 text-white/90 text-xl font-medium"><div class="w-3 h-3 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]"></div> Proprietary Credit Scoring Data</div>
              <div class="flex items-center gap-4 text-white/90 text-xl font-medium"><div class="w-3 h-3 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]"></div> 0% Fraud Gateway via Edge Functions</div>
              <div class="flex items-center gap-4 text-white/90 text-xl font-medium"><div class="w-3 h-3 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]"></div> Corporate Escrow & B2B Invoicing</div>
            </div>
          </div>
          <div class="animate-float delay-300">
            <img src="data:image/png;base64,${IMG3}" alt="Financial Moat" class="w-full rounded-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10" />
          </div>
        </div>
      </div>
    </section>

    <!-- CTAs -->
    <footer class="mt-20 border-t border-white/10 pt-24 text-center animate-fade-up">
      <h2 class="text-4xl md:text-6xl font-black text-white mb-10">Ready to define the future?</h2>
      <button class="px-12 py-5 bg-[#D4AF37] text-black text-xl font-bold rounded-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_40px_rgba(212,175,55,0.3)]">
        Request Financial Package
      </button>
      <p class="text-white/40 mt-16 text-sm uppercase tracking-widest">© 2026 BizHub Technologies Inc.</p>
    </footer>

  </main>
</body>
</html>
HTML

echo "Successfully wrote $OUTPUT_FILE"

"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import HomeSearchFilter from '@/components/ui/HomeSearchFilter';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const categories = [
    { name: 'Food & Restaurants', icon: '🍽️', slug: 'Food & Restaurants' },
    { name: 'Retail & Shopping', icon: '🛍️', slug: 'Retail & Shopping' },
    { name: 'Services', icon: '🔧', slug: 'Services' },
    { name: 'Healthcare', icon: '🏥', slug: 'Healthcare' },
    { name: 'Technology', icon: '💻', slug: 'Technology' },
    { name: 'Education', icon: '📚', slug: 'Education' },
    { name: 'Entertainment', icon: '🎬', slug: 'Entertainment' },
    { name: 'Agriculture', icon: '🌾', slug: 'Agriculture' },
  ];

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: 'Smart Directory',
      description: 'Find verified businesses with detailed contact information, operating hours, and customer reviews.',
      link: '/directory',
      linkText: 'Browse Directory',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Exclusive Deals',
      description: 'Discover exclusive discounts and special offers from your favorite local businesses.',
      link: '/deals',
      linkText: 'View Deals',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Local Events',
      description: 'Stay updated with upcoming events, workshops, and community gatherings in Thika.',
      link: '/events',
      linkText: 'Explore Events',
    },
  ];

  const stats = [
    { value: '500+', label: 'Verified Businesses' },
    { value: '1,000+', label: 'Happy Customers' },
    { value: '50+', label: 'Daily Deals' },
    { value: '24/7', label: 'Support Available' },
  ];

  const handleCategoryClick = (category: string) => {
    router.push(`/directory?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-hero overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-dots opacity-30"></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0D1F16]/50"></div>

        {/* Animated Shapes */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#40916C]/20 rounded-full blur-3xl animate-float delay-500"></div>

        <div className="relative container mx-auto px-4 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-white/90">Thika's #1 Business Directory</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 heading-display animate-fade-in-up">
              Discover Local
              <span className="block text-[#D4AF37]">Businesses in Thika</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              Find deals, share experiences, and support your community.
            </p>

            {/* Search Filter */}
            <div className="max-w-2xl mx-auto animate-fade-in-up delay-300">
              <HomeSearchFilter />
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 animate-fade-in delay-500">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-[#D4AF37]">{stat.value}</div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-12 bg-white relative z-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="glass-card rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-[#1A1A1A] text-center mb-6">
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category.slug)}
                  className="group flex flex-col items-center p-4 rounded-xl bg-[#1B4332]/5 hover:bg-[#1B4332] transition-all duration-300 cursor-pointer"
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{category.icon}</span>
                  <span className="text-xs font-medium text-[#525252] group-hover:text-white text-center transition-colors">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/directory" className="text-sm text-[#1B4332] hover:text-[#D4AF37] font-medium transition-colors">
                View All Categories →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-[#1B4332]/10 text-[#1B4332] text-sm font-semibold rounded-full mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] heading-section mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-[#525252] max-w-2xl mx-auto">
              Discover the features that make ThikaBizHub the perfect platform for finding and connecting with local businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group card-premium p-8 hover:shadow-2xl"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#525252] mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <Link
                  href={feature.link}
                  className="inline-flex items-center gap-2 text-[#1B4332] font-semibold hover:text-[#D4AF37] transition-colors group/link"
                >
                  {feature.linkText}
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 md:p-16">
            <div className="absolute inset-0 pattern-grid opacity-20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl"></div>

            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white heading-section mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-white/70 mb-8">
                Join our growing community of local businesses and customers in Thika.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link
                    href="/directory/add"
                    className="btn btn-lg btn-gold btn-pill font-bold shadow-xl"
                  >
                    Add Your Business
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="btn btn-lg btn-gold btn-pill font-bold shadow-xl"
                    >
                      Sign Up Free
                    </Link>
                    <Link
                      href="/directory/add"
                      className="btn btn-lg btn-pill border-2 border-white/30 text-white font-semibold hover:bg-white/10"
                    >
                      List Your Business
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof of Visit Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-[#1B4332]/10 text-[#1B4332] text-sm font-semibold rounded-full mb-4">
                Community Driven
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] heading-section mb-6">
                Share Your Experiences
              </h2>
              <p className="text-lg text-[#525252] mb-8 leading-relaxed">
                Our Proof of Visit feature lets you share authentic experiences from local businesses. Help others discover great places!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/proof-of-visit"
                  className="btn btn-primary btn-lg btn-pill"
                >
                  Share Experience
                </Link>
                <Link
                  href="/directory"
                  className="btn btn-secondary btn-lg btn-pill"
                >
                  Find Businesses
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['🍽️', '☕', '🛍️', '💇'].map((emoji, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-2xl bg-gradient-to-br from-[#1B4332]/5 to-[#2D6A4F]/10 flex items-center justify-center ${i === 1 ? 'translate-y-6' : ''}`}
                >
                  <span className="text-4xl">{emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

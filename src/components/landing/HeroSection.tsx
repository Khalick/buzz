import HomeSearchFilter from '@/components/ui/HomeSearchFilter';
import { STATS } from '@/constants/landing-page';

export default function HeroSection() {
    return (
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
                        {STATS.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl font-bold text-[#D4AF37]">{stat.value}</div>
                                <div className="text-xs text-white/60">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

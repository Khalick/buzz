import Link from 'next/link';
import { MapPin, Tag, Calendar, ChevronRight } from 'lucide-react';
import { FEATURES } from '@/constants/landing-page';

export default function FeaturesSection() {
    const getIcon = (index: number) => {
        switch (index) {
            case 0: return <MapPin className="w-6 h-6" />;
            case 1: return <Tag className="w-6 h-6" />;
            case 2: return <Calendar className="w-6 h-6" />;
            default: return <MapPin className="w-6 h-6" />;
        }
    };

    return (
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
                    {FEATURES.map((feature, index) => (
                        <div
                            key={index}
                            className="group card-premium p-8 hover:shadow-2xl"
                        >
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                                {getIcon(index)}
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
                                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

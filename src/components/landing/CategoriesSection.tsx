'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/constants/landing-page';

export default function CategoriesSection() {
    const router = useRouter();

    const handleCategoryClick = (category: string) => {
        router.push(`/directory?category=${encodeURIComponent(category)}`);
    };

    return (
        <section className="py-12 bg-white relative z-10">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="glass-card rounded-2xl p-6 md:p-8 shadow-xl">
                    <h2 className="text-xl font-bold text-[#1A1A1A] text-center mb-6">
                        Browse by Category
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                        {CATEGORIES.map((category, index) => (
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
    );
}

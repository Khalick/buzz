'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function CTASection() {
    const { user } = useAuth();

    return (
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
    );
}

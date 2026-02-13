import Link from 'next/link';
import { PROOF_OF_VISIT_EMOJIS } from '@/constants/landing-page';

export default function ProofOfVisitSection() {
    return (
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
                        {PROOF_OF_VISIT_EMOJIS.map((emoji, i) => (
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
    );
}

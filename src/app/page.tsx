import HeroSection from '@/components/landing/HeroSection';
import CategoriesSection from '@/components/landing/CategoriesSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CTASection from '@/components/landing/CTASection';
import ProofOfVisitSection from '@/components/landing/ProofOfVisitSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <CategoriesSection />
      <FeaturesSection />
      <CTASection />
      <ProofOfVisitSection />
    </div>
  );
}

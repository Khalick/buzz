import HeroSection from '@/components/landing/HeroSection';
import CategoriesSection from '@/components/landing/CategoriesSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CTASection from '@/components/landing/CTASection';
import ProofOfVisitSection from '@/components/landing/ProofOfVisitSection';
import ForYouRecommendations from '@/components/landing/ForYouRecommendations';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ForYouRecommendations />
      <CategoriesSection />
      <FeaturesSection />
      <CTASection />
      <ProofOfVisitSection />
    </div>
  );
}

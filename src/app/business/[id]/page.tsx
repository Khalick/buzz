'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Star,
  MessageCircle,
  Clock,
  Eye,
  Share2,
  Navigation,
  Mail,
  ChevronLeft,
  ChevronRight,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import ReviewForm from '@/components/ui/ReviewForm';
import ReviewList from '@/components/ui/ReviewList';
import FavoriteButton from '@/components/ui/FavoriteButton';
import ContactForm from '@/components/ui/ContactForm';

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  location: {
    county: string;
    town: string;
    address: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  website?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  business_hours?: Record<string, { open: string; close: string; closed: boolean }>;
  images: string[];
  rating: number;
  review_count: number;
  is_premium: boolean;
  views: number;
  created_at: string;
  owner_id?: string | null;
  submitted_by?: string | null;
}

export default function BusinessDetailPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [reviewRefresh, setReviewRefresh] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    fetchBusiness();
    fetchCurrentUser();
  }, [businessId]);

  const fetchBusiness = async () => {
    try {
      const res = await fetch(`/api/businesses?search=&page=1&limit=1`);
      // We need a dedicated single-business endpoint, so let's use supabase directly
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      setBusiness(data);
    } catch (err) {
      console.error('Error fetching business:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    } catch {
      // Not logged in
    }
  };

  const getWhatsAppLink = () => {
    if (!business) return '#';
    const phone = business.contact.whatsapp || business.contact.phone;
    const message = `Hi! I found your business "${business.name}" on ThikaBizHub. I'd like to know more.`;
    return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

  const getDirectionsLink = () => {
    if (!business?.coordinates) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${business.coordinates.latitude},${business.coordinates.longitude}`;
  };

  const handleShare = async () => {
    if (navigator.share && business) {
      await navigator.share({
        title: business.name,
        text: `Check out ${business.name} on ThikaBizHub!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#1B4332]/10 rounded w-1/3" />
            <div className="h-64 bg-[#1B4332]/10 rounded-2xl" />
            <div className="h-6 bg-[#1B4332]/10 rounded w-2/3" />
            <div className="h-4 bg-[#1B4332]/5 rounded w-full" />
            <div className="h-4 bg-[#1B4332]/5 rounded w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Business not found</h2>
          <p className="text-[#525252] mb-4">This business may have been removed or doesn&apos;t exist.</p>
          <Link href="/directory" className="btn btn-primary">
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-hero py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {business.is_premium && (
                  <span className="bg-[#D4AF37] text-[#1B4332] text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ PREMIUM
                  </span>
                )}
                <span className="bg-white/10 text-white text-xs font-medium px-3 py-1 rounded-full border border-white/20">
                  {business.category}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white heading-display mb-2">
                {business.name}
              </h1>
              <div className="flex items-center gap-4 text-white/70 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="text-white font-semibold">{business.rating?.toFixed(1) || '0.0'}</span>
                  <span>({business.review_count || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{business.views || 0} views</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Owner actions */}
              {currentUserId && (business.owner_id === currentUserId || business.submitted_by === currentUserId) && (
                <Link
                  href={`/dashboard/edit/${business.id}`}
                  className="p-2.5 bg-[#D4AF37] hover:bg-[#C9A431] rounded-xl transition-colors flex items-center gap-1.5"
                  title="Manage Business"
                >
                  <Settings className="h-4 w-4 text-[#1B4332]" />
                  <span className="text-xs font-bold text-[#1B4332] hidden sm:inline">Manage</span>
                </Link>
              )}
              <FavoriteButton businessId={business.id} />
              <button
                onClick={handleShare}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <Share2 className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Image Gallery */}
        {business.images && business.images.length > 0 && (
          <div className="mb-8">
            <div className="relative rounded-2xl overflow-hidden shadow-xl h-72 md:h-96">
              <img
                src={business.images[currentImageIndex]}
                alt={`${business.name} - Photo ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {business.images.length > 1 && (
                <>
                  {/* Prev/Next Arrows */}
                  <button
                    onClick={() => setCurrentImageIndex(i => i === 0 ? business.images.length - 1 : i - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(i => i === business.images.length - 1 ? 0 : i + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  {/* Counter */}
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    {currentImageIndex + 1} / {business.images.length}
                  </div>
                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {business.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          i === currentImageIndex
                            ? 'bg-white scale-125'
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
              <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">About</h2>
              <p className="text-[#525252] leading-relaxed">{business.description}</p>
            </div>

            {/* Business Hours */}
            {business.business_hours && Object.keys(business.business_hours).length > 0 && (
              <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#1B4332]" />
                  Business Hours
                </h2>
                <div className="space-y-2">
                  {Object.entries(business.business_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="font-medium text-[#1A1A1A] capitalize">{day}</span>
                      <span className={hours.closed ? 'text-red-500' : 'text-[#525252]'}>
                        {hours.closed ? 'Closed' : `${hours.open} – ${hours.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Reviews & Ratings</h2>
              <ReviewList
                businessId={business.id}
                currentUserId={currentUserId}
                refreshTrigger={reviewRefresh}
              />

              <div className="mt-6">
                <ReviewForm
                  businessId={business.id}
                  onReviewSubmitted={() => {
                    setReviewRefresh((prev) => prev + 1);
                    fetchBusiness(); // Refresh business rating
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar: Contact & Actions */}
          <div className="space-y-4">
            {/* Contact Card */}
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-4">
              <h3 className="font-bold text-[#1A1A1A]">Contact</h3>

              {business.location && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-[#1B4332] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[#1A1A1A] font-medium">{business.location.address}</p>
                    <p className="text-[#737373]">{business.location.town}, {business.location.county}</p>
                  </div>
                </div>
              )}

              {business.contact?.phone && (
                <a href={`tel:${business.contact.phone}`} className="flex items-center gap-3 text-sm text-[#525252] hover:text-[#1B4332] transition-colors">
                  <Phone className="h-4 w-4 text-[#1B4332] flex-shrink-0" />
                  {business.contact.phone}
                </a>
              )}

              {business.contact?.email && (
                <a href={`mailto:${business.contact.email}`} className="flex items-center gap-3 text-sm text-[#525252] hover:text-[#1B4332] transition-colors">
                  <Mail className="h-4 w-4 text-[#1B4332] flex-shrink-0" />
                  {business.contact.email}
                </a>
              )}

              {business.website && (
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-[#525252] hover:text-[#1B4332] transition-colors">
                  <Globe className="h-4 w-4 text-[#1B4332] flex-shrink-0" />
                  Visit Website
                </a>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {(business.contact?.whatsapp || business.contact?.phone) && (
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#20BD5C] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              )}

              {business.coordinates && (
                <a
                  href={getDirectionsLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#1B4332] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </a>
              )}

              {business.contact?.phone && (
                <a
                  href={`tel:${business.contact.phone}`}
                  className="w-full bg-white text-[#1B4332] border-2 border-[#1B4332]/20 py-3 rounded-xl font-semibold text-sm hover:bg-[#1B4332]/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
              )}
            </div>

            {/* Claim Business Button */}
            {currentUserId && !business.owner_id && business.submitted_by !== currentUserId && (
              <button
                onClick={async () => {
                  setClaiming(true);
                  try {
                    const { supabase } = await import('@/lib/supabase');
                    await supabase.from('businesses').update({ owner_id: currentUserId }).eq('id', business.id);
                    setBusiness(prev => prev ? { ...prev, owner_id: currentUserId } : null);
                  } catch (e) { console.error(e); }
                  setClaiming(false);
                }}
                disabled={claiming}
                className="w-full bg-[#D4AF37]/10 text-[#856404] border-2 border-[#D4AF37]/20 py-3 rounded-xl font-semibold text-sm hover:bg-[#D4AF37]/20 transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                {claiming ? 'Claiming...' : 'Claim This Business'}
              </button>
            )}

            {/* Contact Form */}
            <ContactForm
              businessId={business.id}
              businessName={business.name}
              ownerId={business.owner_id}
            />
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-16" />
    </div>
  );
}

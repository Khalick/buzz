'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, MapPin, Phone, Globe, Star, MessageCircle, TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';
import SearchFilter from '@/components/ui/SearchFilter';
import FavoriteButton from '@/components/ui/FavoriteButton';

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
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  images: string[];
  rating: number;
  reviewCount: number;
  isPremium: boolean;
  stats?: {
    views: number;
    favorites: number;
    clicks: number;
  };
  businessHours?: any;
}

interface PaginationInfo {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
}

const ITEMS_PER_PAGE = 12;

const categories = [
  'All Categories',
  'Retail & Shopping',
  'Food & Restaurants',
  'Services',
  'Technology',
  'Healthcare',
  'Education',
  'Entertainment',
  'Agriculture',
  'Manufacturing',
  'Other'
];

const counties = [
  'All Counties',
  'Kiambu',
  'Murang\'a',
  'Nyeri',
  'Nyandarua',
  'Kirinyaga',
  'Embu',
  'Tharaka Nithi',
  'Meru',
  'Isiolo',
  'Marsabit',
  'Samburu',
  'Baringo',
  'Laikipia'
];

export default function DirectoryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
    totalPages: 1
  });

  useEffect(() => {
    fetchBusinesses();
  }, [searchQuery, selectedCategory, selectedCounty, pagination.currentPage]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== 'All Categories' && { category: selectedCategory }),
        ...(selectedCounty !== 'All Counties' && { county: selectedCounty })
      });

      const response = await fetch(`/api/businesses?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }

      const data = await response.json();
      setBusinesses(data.businesses);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const BusinessCard = ({ business }: { business: Business }) => {
    const getWhatsAppLink = () => {
      const phone = business.contact.whatsapp || business.contact.phone;
      const message = `Hi! I found your business "${business.name}" on ThikaBizHub. I'd like to know more.`;
      return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    };

    const isTrending = business.stats && business.stats.views > 100;

    return (
      <div className={`group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 relative ${business.isPremium ? 'ring-2 ring-[#D4AF37]' : ''}`}>
        <div className="absolute top-3 left-3 z-10">
          <FavoriteButton businessId={business.id} />
        </div>

        {business.isPremium && (
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#E4C767] text-[#1B4332] text-xs font-bold py-1.5 px-4 flex items-center justify-between">
            <span className="flex items-center gap-1">⭐ PREMIUM</span>
            {isTrending && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Trending
              </span>
            )}
          </div>
        )}

        <div className="relative h-48 bg-gradient-to-br from-[#1B4332]/5 to-[#2D6A4F]/10">
          {business.images && business.images.length > 0 ? (
            <img
              src={business.images[0]}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#1B4332]/30">
              <Grid className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-[#1B4332]">
            {business.category}
          </div>
          {business.stats && business.stats.views > 0 && (
            <div className="absolute bottom-3 right-3 bg-[#1B4332]/80 text-white rounded-full px-2 py-1 text-xs flex items-center gap-1 backdrop-blur-sm">
              <Eye className="h-3 w-3" />
              {business.stats.views}
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 group-hover:text-[#1B4332] transition-colors">{business.name}</h3>
          <p className="text-[#525252] text-sm mb-4 line-clamp-2">{business.description}</p>

          <div className="space-y-2 mb-4">
            {business.location && (
              <div className="flex items-center text-sm text-[#525252]">
                <MapPin className="h-4 w-4 mr-2 text-[#1B4332]" />
                {business.location.town && business.location.county ?
                  `${business.location.town}, ${business.location.county}` :
                  'Location not specified'}
              </div>
            )}
            {business.contact && business.contact.phone && (
              <div className="flex items-center text-sm text-[#525252]">
                <Phone className="h-4 w-4 mr-2 text-[#1B4332]" />
                {business.contact.phone}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E5E5E5]">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-[#D4AF37] fill-current" />
              <span className="text-sm text-[#525252] ml-1">
                {business.rating ? business.rating.toFixed(1) : '0.0'} ({business.reviewCount || 0})
              </span>
            </div>
            {business.website && (
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#1B4332] hover:text-[#D4AF37] flex items-center gap-1">
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(business.contact.whatsapp || business.contact.phone) && (
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-3 py-2.5 rounded-xl hover:bg-[#20BD5C] transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
            <Link
              href={`/business/${business.id}`}
              className="bg-[#1B4332] text-white px-3 py-2.5 rounded-xl hover:bg-[#2D6A4F] transition-colors text-sm font-medium text-center"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const BusinessListItem = ({ business }: { business: Business }) => (
    <div className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${business.isPremium ? 'ring-2 ring-[#D4AF37]' : ''}`}>
      <div className="flex items-start space-x-6">
        <div className="relative w-28 h-28 bg-gradient-to-br from-[#1B4332]/5 to-[#2D6A4F]/10 rounded-xl overflow-hidden flex-shrink-0">
          {business.images && business.images.length > 0 ? (
            <img
              src={business.images[0]}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#1B4332]/30">
              <Grid className="h-8 w-8" />
            </div>
          )}
          {business.isPremium && (
            <div className="absolute top-0 right-0 bg-[#D4AF37] text-[#1B4332] text-[10px] font-bold px-1.5 py-0.5 rounded-bl">
              ⭐
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">{business.name}</h3>
              <p className="text-sm text-[#1B4332] font-medium mb-2">{business.category}</p>
              <p className="text-[#525252] text-sm mb-3 line-clamp-2">{business.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[#525252]">
                {business.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-[#1B4332]" />
                    {business.location.town && business.location.county ?
                      `${business.location.town}, ${business.location.county}` :
                      'Location not specified'}
                  </div>
                )}
                {business.contact && business.contact.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-[#1B4332]" />
                    {business.contact.phone}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-[#D4AF37] fill-current" />
                <span className="text-sm text-[#525252] ml-1">
                  {business.rating ? business.rating.toFixed(1) : '0.0'} ({business.reviewCount || 0})
                </span>
              </div>
              <Link
                href={`/business/${business.id}`}
                className="bg-[#1B4332] text-white px-4 py-2 rounded-xl hover:bg-[#2D6A4F] transition-colors text-sm font-medium"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Pagination = () => (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={!pagination.hasPrevPage}
        className="px-4 py-2 border-2 border-[#1B4332]/20 rounded-xl text-[#1B4332] hover:bg-[#1B4332]/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
      >
        Previous
      </button>

      <div className="flex gap-1">
        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
          const pageNum = Math.max(1, pagination.currentPage - 2) + i;
          if (pageNum > pagination.totalPages) return null;

          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`w-10 h-10 rounded-xl font-medium transition-all ${pageNum === pagination.currentPage
                  ? 'bg-[#1B4332] text-white shadow-lg'
                  : 'text-[#525252] hover:bg-[#1B4332]/10'
                }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={!pagination.hasNextPage}
        className="px-4 py-2 border-2 border-[#1B4332]/20 rounded-xl text-[#1B4332] hover:bg-[#1B4332]/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header Section */}
      <div className="bg-gradient-hero py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-white/20">
            500+ Verified Businesses
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 heading-display">
            Business Directory
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Discover amazing local businesses in Thika and connect with them instantly
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-8">
        {/* Search Card */}
        <div className="glass-card rounded-2xl p-6 mb-8 shadow-xl">
          <SearchFilter
            onSearch={(query: string) => {
              setSearchQuery(query);
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
            onCategoryFilter={(category: string) => {
              setSelectedCategory(category);
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
            onLocationFilter={(county: string) => {
              setSelectedCounty(county);
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
            categories={categories}
            locations={counties}
          />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[#525252]">
            Showing <span className="font-semibold text-[#1B4332]">{businesses.length}</span> businesses
            {searchQuery && <span> for "<span className="font-medium">{searchQuery}</span>"</span>}
            {selectedCategory !== 'All Categories' && <span> in <span className="font-medium">{selectedCategory}</span></span>}
          </p>

          <div className="flex items-center gap-1 p-1 bg-[#1B4332]/5 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#1B4332] text-white shadow' : 'text-[#525252] hover:text-[#1B4332]'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#1B4332] text-white shadow' : 'text-[#525252] hover:text-[#1B4332]'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Business Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-[420px] animate-pulse overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-[#1B4332]/10 to-[#2D6A4F]/5"></div>
                <div className="p-6 space-y-4">
                  <div className="h-5 bg-[#1B4332]/10 rounded w-3/4"></div>
                  <div className="h-4 bg-[#1B4332]/5 rounded w-full"></div>
                  <div className="h-4 bg-[#1B4332]/5 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : businesses.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {businesses.map((business) => (
              viewMode === 'grid' ? (
                <BusinessCard key={business.id} business={business} />
              ) : (
                <BusinessListItem key={business.id} business={business} />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1B4332]/10 flex items-center justify-center">
              <Search className="h-8 w-8 text-[#1B4332]/50" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No businesses found</h3>
            <p className="text-[#525252] mb-6">
              Try adjusting your search criteria or{' '}
              <Link href="/directory/add" className="text-[#1B4332] hover:text-[#D4AF37] font-medium">
                add a new business
              </Link>
            </p>
          </div>
        )}

        {/* Pagination */}
        {businesses.length > 0 && <Pagination />}

        {/* Add Business CTA */}
        <div className="mt-16 mb-8 relative overflow-hidden rounded-2xl bg-gradient-hero p-10 md:p-12">
          <div className="absolute inset-0 pattern-dots opacity-20"></div>
          <div className="relative text-center max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Don't see your business?
            </h3>
            <p className="text-white/70 mb-8">
              Join our directory and connect with thousands of local customers in Thika
            </p>
            <Link
              href="/directory/add"
              className="btn btn-gold btn-lg btn-pill font-bold shadow-xl"
            >
              Add Your Business Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

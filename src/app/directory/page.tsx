'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Grid, List, MapPin as MapPinIcon, Phone, Globe, Star, MessageCircle, TrendingUp, Eye, Clock, GitCompareArrows, Map, Bell } from 'lucide-react';
import Link from 'next/link';
import SearchFilter from '@/components/ui/SearchFilter';
import FavoriteButton from '@/components/ui/FavoriteButton';
import BusinessCompare from '@/components/ui/BusinessCompare';
import MapView from '@/components/ui/MapView';
import SmartAlertsModal from '@/components/ui/SmartAlertsModal';
import { isBusinessOpen, getTodayHours } from '@/lib/business-hours';

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

export default function DirectoryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [sortBy, setSortBy] = useState('newest');
  const [minRating, setMinRating] = useState(0);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [compareList, setCompareList] = useState<Business[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
    totalPages: 1
  });

  // Client-side Open Now filter
  const filteredBusinesses = useMemo(() => {
    let result = businesses;
    if (openNowOnly) {
      result = result.filter(b => isBusinessOpen(b.businessHours));
    }
    return result;
  }, [businesses, openNowOnly]);

  useEffect(() => {
    fetchBusinesses();
  }, [searchQuery, selectedCategory, selectedCounty, sortBy, minRating, pagination.currentPage]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '12',
      });

      if (searchQuery) queryParams.append('search', searchQuery);
      if (selectedCategory !== 'All Categories') queryParams.append('category', selectedCategory);
      if (selectedCounty !== 'All Counties') queryParams.append('county', selectedCounty);
      if (sortBy) queryParams.append('sort', sortBy);
      if (minRating > 0) queryParams.append('minRating', minRating.toString());

      const res = await fetch(`/api/businesses?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch businesses');
      const data = await res.json();

      setBusinesses(data.businesses || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
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

  const toggleCompare = (business: Business) => {
    setCompareList(prev => {
      const exists = prev.find(b => b.id === business.id);
      if (exists) {
        return prev.filter(b => b.id !== business.id);
      }
      if (prev.length >= 3) {
        alert("You can only compare up to 3 businesses at a time.");
        return prev;
      }
      return [...prev, business];
    });
  };

  // Convert custom Business to MapView expectation
  const mapBusinesses = filteredBusinesses.map(b => ({
    id: b.id,
    name: b.name,
    category: b.category,
    rating: b.rating,
    location: {
      lat: b.coordinates?.latitude,
      lng: b.coordinates?.longitude,
      town: b.location?.town,
      county: b.location?.county
    }
  }));

  const BusinessCard = ({ business }: { business: Business }) => {
    const getWhatsAppLink = () => {
      const phone = business.contact.whatsapp || business.contact.phone || '';
      return `https://wa.me/${phone?.replace(/\D/g, '')}`;
    };

    const isTrending = business.stats && business.stats.views > 100;
    const isOpen = isBusinessOpen(business.businessHours);
    const isCompared = compareList.some(b => b.id === business.id);

    return (
      <div className={`group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 relative ${business.isPremium ? 'ring-2 ring-[#D4AF37]' : ''}`}>
        <div className="absolute top-3 left-3 z-10 flex gap-1.5 items-center">
          <FavoriteButton businessId={business.id} />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCompare(business);
            }}
            title={isCompared ? "Remove from compare" : "Add to compare (max 3)"}
            className={`p-2 rounded-full transition-colors flex items-center justify-center backdrop-blur-sm shadow-sm ${
              isCompared ? 'bg-[#1B4332] text-white' : 'bg-white/80 text-[#525252] hover:bg-white hover:text-[#1B4332]'
            }`}
          >
            <GitCompareArrows className="h-4 w-4" />
          </button>
        </div>

        {business.isPremium && (
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#E4C767] text-[#1B4332] text-xs font-bold py-1.5 px-4 flex items-center justify-between relative z-20">
            <span className="flex items-center gap-1">⭐ PREMIUM</span>
            {isTrending && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Trending
              </span>
            )}
          </div>
        )}

        <div className={`relative h-48 bg-gradient-to-br from-[#1B4332]/5 to-[#2D6A4F]/10 ${!business.isPremium ? 'pt-10' : ''}`}>
          <div className="absolute inset-0 flex items-center justify-center text-[#1B4332]/30">
            <Grid className="h-12 w-12" />
          </div>
          
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-[#1B4332]">
              {business.category}
            </span>
            {business.businessHours && (
              <span className={`backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm ${
                isOpen
                  ? 'bg-green-500/90 text-white'
                  : 'bg-red-500/80 text-white'
              }`}>
                <Clock className="h-2.5 w-2.5" />
                {isOpen ? 'Open Now' : 'Closed'}
              </span>
            )}
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
                <MapPinIcon className="h-4 w-4 mr-2 text-[#1B4332]" />
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
              className="bg-[#1B4332] text-white px-3 py-2.5 rounded-xl hover:bg-[#2D6A4F] transition-colors text-sm font-medium text-center flex items-center justify-center"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">Business Directory</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search businesses, categories, or locations..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-lg focus:ring-2 focus:ring-[#1B4332] outline-none text-[#1A1A1A] text-lg bg-white"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373] h-6 w-6" />
            </div>
          </div>
          <button 
            onClick={() => setShowAlertModal(true)}
            className="flex items-center justify-center gap-2 bg-white text-[#1B4332] border border-[#1B4332]/20 px-6 py-4 rounded-2xl font-bold hover:bg-[#1B4332]/5 transition-colors shadow-sm whitespace-nowrap h-[60px]"
          >
            <Bell className="h-5 w-5" />
            Alert Me
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#E5E5E5]">
                <Filter className="h-5 w-5 text-[#1B4332]" />
                <h2 className="font-bold text-[#1A1A1A]">Filters</h2>
              </div>
              
              <SearchFilter 
                onSortChange={(sort) => {
                  setSortBy(sort);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                onRatingFilter={(rating) => {
                  setMinRating(rating);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            
            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <p className="text-[#525252]">
                Showing <span className="font-semibold text-[#1B4332]">{filteredBusinesses.length}</span> businesses
                {searchQuery && <span> for "<span className="font-medium">{searchQuery}</span>"</span>}
                {openNowOnly && <span className="text-green-600 font-medium"> (open now)</span>}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {/* Open Now Toggle */}
                <button
                  onClick={() => setOpenNowOnly(!openNowOnly)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    openNowOnly
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-[#1B4332]/5 text-[#525252] hover:bg-[#1B4332]/10'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Open Now
                </button>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-[#1B4332]/5 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-[#1B4332] shadow-sm' : 'text-[#737373] hover:text-[#1B4332]'}`}
                    title="Grid View"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-[#1B4332] shadow-sm' : 'text-[#737373] hover:text-[#1B4332]'}`}
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-white text-[#1B4332] shadow-sm' : 'text-[#737373] hover:text-[#1B4332]'}`}
                    title="Map View"
                  >
                    <Map className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Business Content */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl h-96 animate-pulse border border-[#E5E5E5]">
                    <div className="h-48 bg-[#E5E5E5] rounded-t-2xl" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-[#E5E5E5] rounded w-3/4" />
                      <div className="h-4 bg-[#E5E5E5] rounded w-full" />
                      <div className="h-4 bg-[#E5E5E5] rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-[#E5E5E5]">
                <Search className="h-12 w-12 text-[#D4D4D4] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No businesses found</h3>
                <p className="text-[#525252]">
                  We couldn't find any businesses matching your search criteria. 
                  Try adjusting your filters or search terms.
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Categories');
                    setSelectedCounty('All Counties');
                    setOpenNowOnly(false);
                  }}
                  className="mt-6 bg-[#1B4332] text-white px-6 py-3 rounded-xl hover:bg-[#2D6A4F] transition-colors font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'map' ? (
              <MapView businesses={mapBusinesses} />
            ) : (
              <div>
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                    : 'space-y-4'
                }>
                  {filteredBusinesses.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 rounded-xl border border-[#E5E5E5] bg-white text-[#525252] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1 mx-4">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-xl font-semibold transition-colors flex items-center justify-center ${
                            pagination.currentPage === page
                              ? 'bg-[#1B4332] text-white shadow-md'
                              : 'text-[#525252] hover:bg-[#1B4332]/10'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 rounded-xl border border-[#E5E5E5] bg-white text-[#525252] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {compareList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowCompare(true)}
            className="bg-[#D4AF37] text-[#1B4332] px-6 py-3 rounded-full font-bold shadow-xl hover:bg-[#E4C767] hover:scale-105 transition-all flex items-center gap-2"
          >
            <GitCompareArrows className="h-5 w-5" />
            Compare Businesses ({compareList.length})
          </button>
        </div>
      )}

      {showCompare && (
        <BusinessCompare
          businesses={compareList}
          onClose={() => setShowCompare(false)}
          onRemove={(id) => setCompareList(prev => prev.filter(b => b.id !== id))}
        />
      )}

      <SmartAlertsModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        currentSearch={searchQuery}
        currentCategory={selectedCategory}
        currentCounty={selectedCounty}
      />
    </div>
  );
}

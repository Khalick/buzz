"use client";

import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Star, X, ChevronDown } from 'lucide-react';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
  onLocationFilter: (location: string) => void;
  onSortChange?: (sort: string) => void;
  onRatingFilter?: (minRating: number) => void;
  categories: string[];
  locations: string[];
  className?: string;
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'name', label: 'A – Z' },
];

const SearchFilter = ({
  onSearch,
  onCategoryFilter,
  onLocationFilter,
  onSortChange,
  onRatingFilter,
  categories,
  locations,
  className = ""
}: SearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedRating, setSelectedRating] = useState(0);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Stable callback refs
  const onSearchRef = useCallback(onSearch, [onSearch]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearchRef(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, onSearchRef]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryFilter(category);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    onLocationFilter(location);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    onSortChange?.(sort);
  };

  const handleRatingChange = (rating: number) => {
    const newRating = selectedRating === rating ? 0 : rating;
    setSelectedRating(newRating);
    onRatingFilter?.(newRating);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedSort('newest');
    setSelectedRating(0);
    onSearch('');
    onCategoryFilter('');
    onLocationFilter('');
    onSortChange?.('newest');
    onRatingFilter?.(0);
  };

  const hasActiveFilters = selectedCategory || selectedLocation || searchQuery || selectedRating > 0 || selectedSort !== 'newest';

  return (
    <div className={`${className}`}>
      <div className="space-y-4">
        {/* Main Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#1B4332]/40" />
          </div>
          <input
            type="text"
            placeholder="Search businesses, services, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 text-base transition-all outline-none placeholder:text-[#525252]/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <X className="h-4 w-4 text-[#525252] hover:text-[#1B4332] transition-colors" />
            </button>
          )}
        </div>

        {/* Quick Filters + Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[#525252]">Quick:</span>
            {['Food & Restaurants', 'Retail & Shopping', 'Services', 'Healthcare'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(selectedCategory === cat ? '' : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#1B4332] text-white shadow-md'
                    : 'bg-[#1B4332]/5 text-[#1B4332] hover:bg-[#1B4332]/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-white border-2 border-[#1B4332]/10 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none cursor-pointer transition-all"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1B4332]/40 pointer-events-none" />
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="text-[#1B4332] text-sm font-semibold hover:text-[#2D6A4F] flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Advanced Filters</span>
            <ChevronDown
              className={`h-4 w-4 transform transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-[#525252] hover:text-[#1B4332] font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {isAdvancedOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#1B4332]/10 animate-fade-in">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 text-sm outline-none transition-all"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 text-sm outline-none transition-all"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Minimum Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      selectedRating === star
                        ? 'bg-[#D4AF37] text-[#1B4332] shadow-md'
                        : 'bg-[#1B4332]/5 text-[#525252] hover:bg-[#D4AF37]/20'
                    }`}
                    title={`${star}+ stars`}
                  >
                    <Star className={`h-3.5 w-3.5 ${selectedRating === star ? 'fill-[#1B4332]' : 'fill-none'}`} />
                    {star}+
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-[#525252] font-medium self-center">Active:</span>
            {selectedCategory && (
              <span className="inline-flex items-center px-2.5 py-1 bg-[#1B4332]/10 text-[#1B4332] text-xs font-semibold rounded-full">
                {selectedCategory}
                <button
                  onClick={() => handleCategoryChange('')}
                  className="ml-1.5 text-[#1B4332]/60 hover:text-[#1B4332]"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedLocation && (
              <span className="inline-flex items-center px-2.5 py-1 bg-[#1B4332]/10 text-[#1B4332] text-xs font-semibold rounded-full">
                {selectedLocation}
                <button
                  onClick={() => handleLocationChange('')}
                  className="ml-1.5 text-[#1B4332]/60 hover:text-[#1B4332]"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedRating > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-[#D4AF37]/15 text-[#856404] text-xs font-semibold rounded-full">
                <Star className="h-3 w-3 fill-[#D4AF37] mr-1" />
                {selectedRating}+ stars
                <button
                  onClick={() => handleRatingChange(0)}
                  className="ml-1.5 text-[#856404]/60 hover:text-[#856404]"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedSort !== 'newest' && (
              <span className="inline-flex items-center px-2.5 py-1 bg-[#1B4332]/10 text-[#1B4332] text-xs font-semibold rounded-full">
                {sortOptions.find(o => o.value === selectedSort)?.label}
                <button
                  onClick={() => handleSortChange('newest')}
                  className="ml-1.5 text-[#1B4332]/60 hover:text-[#1B4332]"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
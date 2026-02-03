"use client";

import { useState } from 'react';
import { Search, ChevronDown, X, MapPin, Grid } from 'lucide-react';
import { useRouter } from 'next/navigation';

const categories = [
    { name: 'All Categories', value: '' },
    { name: 'Food & Restaurants', value: 'Food & Restaurants', icon: '🍽️' },
    { name: 'Retail & Shopping', value: 'Retail & Shopping', icon: '🛍️' },
    { name: 'Services', value: 'Services', icon: '🔧' },
    { name: 'Healthcare', value: 'Healthcare', icon: '🏥' },
    { name: 'Technology', value: 'Technology', icon: '💻' },
    { name: 'Education', value: 'Education', icon: '📚' },
    { name: 'Entertainment', value: 'Entertainment', icon: '🎬' },
    { name: 'Agriculture', value: 'Agriculture', icon: '🌾' },
];

const locations = [
    { name: 'All Locations', value: '' },
    { name: 'Kiambu', value: 'Kiambu' },
    { name: "Murang'a", value: "Murang'a" },
    { name: 'Nyeri', value: 'Nyeri' },
    { name: 'Nyandarua', value: 'Nyandarua' },
    { name: 'Kirinyaga', value: 'Kirinyaga' },
    { name: 'Embu', value: 'Embu' },
    { name: 'Tharaka Nithi', value: 'Tharaka Nithi' },
    { name: 'Meru', value: 'Meru' },
    { name: 'Isiolo', value: 'Isiolo' },
    { name: 'Marsabit', value: 'Marsabit' },
    { name: 'Samburu', value: 'Samburu' },
    { name: 'Baringo', value: 'Baringo' },
    { name: 'Laikipia', value: 'Laikipia' },
];

export default function HomeSearchFilter() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedLocation) params.set('county', selectedLocation);
        const queryString = params.toString();
        router.push(`/directory${queryString ? `?${queryString}` : ''}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const clearAll = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedLocation('');
    };

    const hasFilters = searchQuery || selectedCategory || selectedLocation;

    return (
        <div className="bg-white rounded-2xl shadow-xl">
            {/* Main Search Bar */}
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search businesses, services..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-3 bg-[#1B4332] text-white font-semibold rounded-xl hover:bg-[#2D6A4F] transition-colors flex items-center gap-2"
                    >
                        <Search className="h-5 w-5" />
                        <span className="hidden sm:inline">Search</span>
                    </button>
                </div>

                {/* Toggle Filters */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="mt-3 flex items-center gap-2 text-sm font-medium text-[#1B4332] hover:text-[#2D6A4F]"
                >
                    <span>Filters</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    {hasFilters && (
                        <span className="ml-2 px-2 py-0.5 bg-[#1B4332]/10 rounded-full text-xs">
                            {[searchQuery, selectedCategory, selectedLocation].filter(Boolean).length} active
                        </span>
                    )}
                </button>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Grid className="h-4 w-4" />
                                Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{ WebkitAppearance: 'menulist', appearance: 'menulist' }}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.icon ? `${cat.icon} ${cat.name}` : cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Location
                            </label>
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                style={{ WebkitAppearance: 'menulist', appearance: 'menulist' }}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                            >
                                {locations.map((loc) => (
                                    <option key={loc.value} value={loc.value}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filters & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                            {selectedCategory && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1B4332]/10 text-[#1B4332] text-sm rounded-full">
                                    {categories.find(c => c.value === selectedCategory)?.icon} {selectedCategory}
                                    <button onClick={() => setSelectedCategory('')} className="ml-1 hover:text-red-500">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {selectedLocation && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                    📍 {selectedLocation}
                                    <button onClick={() => setSelectedLocation('')} className="ml-1 hover:text-red-500">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {hasFilters && (
                                <button onClick={clearAll} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                                    Clear all
                                </button>
                            )}
                            <button
                                onClick={handleSearch}
                                className="px-6 py-2 bg-[#1B4332] text-white font-medium rounded-lg hover:bg-[#2D6A4F]"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Categories */}
            <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500 py-1">Quick:</span>
                    {categories.slice(1, 5).map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => {
                                setSelectedCategory(cat.value);
                                setShowFilters(true);
                            }}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${selectedCategory === cat.value
                                    ? 'bg-[#1B4332] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

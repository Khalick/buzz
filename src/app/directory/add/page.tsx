"use client";

import { useState, useEffect } from 'react';
import { supabase, uploadFile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Clock, Upload, X, Building2, Phone, Globe, Facebook, Instagram, Twitter, FileText, Camera, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

const AddBusinessPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [business, setBusiness] = useState({
    name: '',
    category: '',
    whatsapp: '',
    description: '',
    address: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
  });

  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '17:00', closed: false },
    sunday: { open: '09:00', close: '17:00', closed: true },
  });

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback categories
        setCategories([
          { id: '1', name: 'Salon' },
          { id: '2', name: 'Cybercafe' },
          { id: '3', name: 'Food Joint' },
          { id: '4', name: 'Boda Rider' },
          { id: '5', name: 'Tutor' },
          { id: '6', name: 'Other' },
        ]);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBusiness(prev => ({ ...prev, [name]: value }));
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], [field]: value }
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      return;
    }

    setImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGettingLocation(false);
      },
      (error) => {
        setLocationError('Unable to get your location. Please try again.');
        setGettingLocation(false);
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const image of images) {
        const path = `${Date.now()}_${image.name}`;
        const url = await uploadFile('businesses', path, image);
        imageUrls.push(url);
      }

      const businessData: any = {
        name: business.name,
        description: business.description,
        category: business.category,
        whatsapp: business.whatsapp,
        address: business.address,
        website: business.website || null,
        approved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: imageUrls,
        business_hours: businessHours,
        social_media: {
          facebook: business.facebook || null,
          instagram: business.instagram || null,
          twitter: business.twitter || null,
        },
        views: 0,
        rating: 0,
        review_count: 0,
        is_premium: false,
        submitted_by: user?.id || null,
      };

      if (location) {
        businessData.coordinates = {
          latitude: location.lat,
          longitude: location.lng,
        };
      }

      const { error } = await supabase
        .from('businesses')
        .insert(businessData);

      if (error) throw error;

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting business: ", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="bg-gradient-hero py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-30"></div>
        </div>
        <div className="max-w-xl mx-auto px-4 -mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Business Submitted!</h2>
            <p className="text-[#525252] mb-6">
              Your business has been submitted for review. We&apos;ll notify you once it&apos;s approved and live on ThikaBizHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/directory"
                className="bg-[#1B4332] text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-[#2D6A4F] transition-colors"
              >
                Browse Directory
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setBusiness({ name: '', category: '', whatsapp: '', description: '', address: '', website: '', facebook: '', instagram: '', twitter: '' });
                  setLocation(null);
                  setImages([]);
                  setImagePreviews([]);
                }}
                className="bg-white text-[#1B4332] border-2 border-[#1B4332]/20 font-semibold py-2.5 px-6 rounded-xl hover:bg-[#1B4332]/5 transition-colors"
              >
                Add Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="bg-gradient-hero py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-white/20">
            <Building2 className="h-4 w-4" />
            List Your Business
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white heading-display mb-3">
            Get Your Business on ThikaBizHub
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Fill out the form below and reach thousands of local customers
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 -mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#1B4332]" />
              Basic Information
            </h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Business Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={business.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all"
                  placeholder="e.g., Mama Njeri's Kitchen"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={business.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all bg-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={business.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all resize-none"
                  rows={4}
                  placeholder="Describe your business, services, and what makes you special..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <Phone className="h-5 w-5 text-[#1B4332]" />
              Contact & Location
            </h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">WhatsApp Number *</label>
                <input
                  type="text"
                  id="whatsapp"
                  name="whatsapp"
                  value={business.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all"
                  placeholder="+2547..."
                  required
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Physical Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={business.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all"
                  placeholder="e.g., Kenyatta Avenue, Thika Town"
                  required
                />
              </div>

              {/* Location Pin */}
              <div className="bg-[#1B4332]/5 border border-[#1B4332]/10 rounded-xl p-4">
                <p className="text-sm text-[#525252] mb-3 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#1B4332] mt-0.5 flex-shrink-0" />
                  Help customers find you by pinning your exact location for Google Maps directions.
                </p>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-semibold py-2.5 px-5 rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  {gettingLocation ? 'Getting Location...' : 'Pin Current Location'}
                </button>
                {location && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-800 font-medium flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" />
                      Location pinned successfully!
                    </p>
                    <p className="text-xs text-green-700 mt-1 ml-5.5">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                )}
                {locationError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-800">{locationError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#1B4332]" />
              Online Presence <span className="text-sm font-normal text-[#737373]">(Optional)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="website" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={business.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all"
                  placeholder="https://yourbusiness.com"
                />
              </div>
              <div>
                <label htmlFor="facebook" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Facebook</label>
                <input
                  type="url"
                  id="facebook"
                  name="facebook"
                  value={business.facebook}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label htmlFor="instagram" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Instagram</label>
                <input
                  type="url"
                  id="instagram"
                  name="instagram"
                  value={business.instagram}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label htmlFor="twitter" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Twitter / X</label>
                <input
                  type="url"
                  id="twitter"
                  name="twitter"
                  value={business.twitter}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all"
                  placeholder="https://x.com/..."
                />
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#1B4332]" />
              Business Hours
            </h2>
            <div className="space-y-3">
              {Object.entries(businessHours).map(([day, hours]) => (
                <div key={day} className="grid grid-cols-4 gap-3 items-center p-3 rounded-xl bg-[#FAFAF8] hover:bg-[#1B4332]/5 transition-colors">
                  <span className="capitalize font-semibold text-[#1A1A1A] text-sm">{day}</span>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    disabled={hours.closed}
                    className="px-3 py-2 border-2 border-[#1B4332]/10 rounded-lg text-sm disabled:bg-[#E5E5E5]/50 disabled:text-[#A3A3A3] outline-none focus:border-[#1B4332]/30"
                  />
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    disabled={hours.closed}
                    className="px-3 py-2 border-2 border-[#1B4332]/10 rounded-lg text-sm disabled:bg-[#E5E5E5]/50 disabled:text-[#A3A3A3] outline-none focus:border-[#1B4332]/30"
                  />
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                      className="w-4 h-4 rounded border-[#1B4332]/20 text-[#1B4332] focus:ring-[#1B4332]/20"
                    />
                    <span className={hours.closed ? 'text-red-500 font-medium' : 'text-[#525252]'}>
                      {hours.closed ? 'Closed' : 'Open'}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#1B4332]" />
              Business Photos <span className="text-sm font-normal text-[#737373]">(Max 5)</span>
            </h2>
            <div className="border-2 border-dashed border-[#1B4332]/20 rounded-xl p-6 bg-[#1B4332]/5 hover:bg-[#1B4332]/10 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-10 w-10 text-[#1B4332]/40 mb-3" />
                <span className="text-sm font-semibold text-[#1B4332]">Click to upload photos</span>
                <span className="text-xs text-[#737373] mt-1">PNG, JPG up to 5MB each</span>
              </label>
            </div>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white font-bold py-4 px-6 rounded-2xl hover:from-[#2D6A4F] hover:to-[#40916C] transition-all shadow-lg shadow-[#1B4332]/20 hover:shadow-[#1B4332]/30 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Submit for Review
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBusinessPage;

"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, uploadFile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  ArrowLeft, Save, Upload, X, MapPin, Clock, Phone, Globe,
  Building2, Camera, CheckCircle, Facebook, Instagram, Twitter
} from 'lucide-react';

interface BusinessData {
  id: string;
  name: string;
  description: string;
  category: string;
  whatsapp: string;
  address: string;
  website: string;
  social_media: { facebook?: string; instagram?: string; twitter?: string };
  business_hours: Record<string, { open: string; close: string; closed: boolean }>;
  images: string[];
  location: { county: string; town: string; address: string } | null;
  coordinates: { latitude: number; longitude: number } | null;
  contact: { phone?: string; email?: string; whatsapp?: string } | null;
  owner_id: string | null;
  submitted_by: string | null;
}

export default function EditBusinessPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    whatsapp: '',
    address: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
  });
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({});
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) fetchBusiness();
  }, [user, authLoading, businessId]);

  const fetchBusiness = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;

      // Verify ownership
      if (data.owner_id !== user?.id && data.submitted_by !== user?.id) {
        router.push('/dashboard');
        return;
      }

      setBusiness(data);
      setForm({
        name: data.name || '',
        description: data.description || '',
        category: data.category || '',
        whatsapp: data.whatsapp || data.contact?.whatsapp || '',
        address: data.address || data.location?.address || '',
        website: data.website || '',
        facebook: data.social_media?.facebook || '',
        instagram: data.social_media?.instagram || '',
        twitter: data.social_media?.twitter || '',
      });
      setHours(data.business_hours || {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '09:00', close: '17:00', closed: true },
      });
      setExistingImages(data.images || []);
    } catch (error) {
      console.error('Error fetching business:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > 5) return;

    setNewImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload new images
      const uploadedUrls: string[] = [];
      for (const image of newImages) {
        const path = `${Date.now()}_${image.name}`;
        const url = await uploadFile('businesses', path, image);
        uploadedUrls.push(url);
      }

      const allImages = [...existingImages, ...uploadedUrls];

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          whatsapp: form.whatsapp,
          address: form.address,
          website: form.website || null,
          social_media: {
            facebook: form.facebook || null,
            instagram: form.instagram || null,
            twitter: form.twitter || null,
          },
          business_hours: hours,
          images: allImages,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      setSaved(true);
      setNewImages([]);
      setNewImagePreviews([]);
      setExistingImages(allImages);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving business:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="bg-gradient-hero py-12 px-4"></div>
        <div className="max-w-3xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
            <div className="h-6 bg-[#1B4332]/10 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-10 bg-[#1B4332]/5 rounded-xl"></div>
              <div className="h-10 bg-[#1B4332]/5 rounded-xl"></div>
              <div className="h-24 bg-[#1B4332]/5 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero */}
      <div className="bg-gradient-hero py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-3xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white heading-display">
            Edit: {business.name}
          </h1>
        </div>
      </div>

      {/* Save Toast */}
      {saved && (
        <div className="fixed top-20 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Changes saved successfully!
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8 -mt-6 space-y-6">

        {/* Basic Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#1B4332]" />
            Basic Information
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Business Name</label>
              <input name="name" value={form.name} onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all resize-none" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
            <Phone className="h-5 w-5 text-[#1B4332]" />
            Contact & Location
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">WhatsApp</label>
              <input name="whatsapp" value={form.whatsapp} onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Address</label>
              <input name="address" value={form.address} onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Website</label>
                <input name="website" value={form.website} onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Facebook</label>
                <input name="facebook" value={form.facebook} onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#1B4332]" />
            Business Hours
          </h2>
          <div className="space-y-3">
            {Object.entries(hours).map(([day, h]) => (
              <div key={day} className="grid grid-cols-4 gap-3 items-center p-3 rounded-xl bg-[#FAFAF8]">
                <span className="capitalize font-semibold text-[#1A1A1A] text-sm">{day}</span>
                <input type="time" value={h.open}
                  onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                  disabled={h.closed}
                  className="px-3 py-2 border-2 border-[#1B4332]/10 rounded-lg text-sm disabled:bg-[#E5E5E5]/50 outline-none" />
                <input type="time" value={h.close}
                  onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                  disabled={h.closed}
                  className="px-3 py-2 border-2 border-[#1B4332]/10 rounded-lg text-sm disabled:bg-[#E5E5E5]/50 outline-none" />
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={h.closed}
                    onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                    className="w-4 h-4 rounded" />
                  <span className={h.closed ? 'text-red-500 font-medium' : 'text-[#525252]'}>
                    {h.closed ? 'Closed' : 'Open'}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#1B4332]" />
            Photos <span className="text-sm font-normal text-[#737373]">({existingImages.length + newImages.length}/5)</span>
          </h2>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {existingImages.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-24 object-cover rounded-xl" />
                  <button type="button" onClick={() => removeExistingImage(i)}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Image Previews */}
          {newImagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {newImagePreviews.map((preview, i) => (
                <div key={i} className="relative group ring-2 ring-[#1B4332]/20 rounded-xl">
                  <img src={preview} alt={`New ${i + 1}`} className="w-full h-24 object-cover rounded-xl" />
                  <button type="button" onClick={() => removeNewImage(i)}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 bg-[#1B4332] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          {existingImages.length + newImages.length < 5 && (
            <div className="border-2 border-dashed border-[#1B4332]/20 rounded-xl p-6 bg-[#1B4332]/5 hover:bg-[#1B4332]/10 transition-colors">
              <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" id="editImageUpload" />
              <label htmlFor="editImageUpload" className="flex flex-col items-center cursor-pointer">
                <Upload className="h-8 w-8 text-[#1B4332]/40 mb-2" />
                <span className="text-sm font-semibold text-[#1B4332]">Add more photos</span>
              </label>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white font-bold py-4 px-6 rounded-2xl hover:from-[#2D6A4F] hover:to-[#40916C] transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
        >
          {saving ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
          ) : (
            <><Save className="h-5 w-5" /> Save Changes</>
          )}
        </button>
      </div>
    </div>
  );
}

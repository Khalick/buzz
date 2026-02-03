"use client";

import { useState, useEffect } from 'react';
import { supabase, uploadFile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { Camera, Upload, MapPin, User, Building2 } from 'lucide-react';

interface Proof {
  id: string;
  name: string;
  business_name: string;
  image_url: string;
  created_at?: string;
}

const ProofOfVisitPage = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchProofs = async () => {
      try {
        const { data, error } = await supabase
          .from('proofs')
          .select('id, name, business_name, image_url, created_at')
          .eq('approved', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProofs(data || []);
      } catch (error) {
        console.error("Error fetching proofs: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProofs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Please select an image to upload.');
      return;
    }
    setSubmitting(true);

    try {
      const path = `${Date.now()}_${imageFile.name}`;
      const imageUrl = await uploadFile('proofs', path, imageFile);

      const { error } = await supabase
        .from('proofs')
        .insert({
          name,
          business_name: businessName,
          image_url: imageUrl,
          approved: false,
          submitted_by: user?.id || null,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      alert('Your proof has been submitted for review. Thank you!');
      setName('');
      setBusinessName('');
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting proof: ", error);
      alert('There was an error submitting your proof.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="bg-gradient-hero py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-white/20">
            <Camera className="h-4 w-4" />
            Community Wall
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 heading-display">
            Proof of Visit
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Share a selfie or receipt from a local business and get featured on our community wall!
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-gold btn-lg btn-pill font-bold shadow-xl"
          >
            <Camera className="w-5 h-5" />
            {showForm ? 'Hide Form' : 'Share Your Visit'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        {/* Upload Form */}
        {showForm && (
          <div className="mb-12 animate-fade-in">
            <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                <Upload className="w-6 h-6 text-[#1B4332]" />
                Submit Your Proof
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    <User className="w-4 h-4 inline mr-2 text-[#1B4332]" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    <Building2 className="w-4 h-4 inline mr-2 text-[#1B4332]" />
                    Business Name
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="input"
                    placeholder="Which business did you visit?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    <Camera className="w-4 h-4 inline mr-2 text-[#1B4332]" />
                    Upload Photo
                  </label>

                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#1B4332]/30 rounded-xl cursor-pointer bg-[#1B4332]/5 hover:bg-[#1B4332]/10 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-10 h-10 text-[#1B4332]/50 mb-3" />
                        <p className="text-sm text-[#525252]">
                          <span className="font-semibold text-[#1B4332]">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-[#737373] mt-1">PNG, JPG up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                      />
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full btn btn-primary btn-lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Submit for Review
                    </>
                  )}
                </button>
              </form>

              <p className="text-sm text-[#737373] mt-4 text-center">
                Your submission will be reviewed before appearing on the wall
              </p>
            </div>
          </div>
        )}

        {/* Community Posts Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#1B4332]" />
              Community Posts
            </h2>
            <span className="text-sm text-[#525252]">
              {proofs.length} {proofs.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-[#1B4332]/10 to-[#2D6A4F]/5"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-[#1B4332]/10 rounded w-3/4"></div>
                    <div className="h-4 bg-[#1B4332]/5 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : proofs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proofs.map((proof, index) => (
                <div
                  key={proof.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-56 bg-gradient-to-br from-[#1B4332]/5 to-[#2D6A4F]/10">
                    <Image
                      src={proof.image_url}
                      alt={`Visit to ${proof.business_name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-bold text-lg">{proof.business_name}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {proof.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">{proof.name}</p>
                        <p className="text-xs text-[#737373]">Verified Visit</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1B4332]/10 flex items-center justify-center">
                <Camera className="h-10 w-10 text-[#1B4332]/50" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">No Posts Yet</h3>
              <p className="text-[#525252] mb-8">Be the first to share your visit experience!</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary btn-lg btn-pill"
              >
                <Camera className="w-5 h-5" />
                Share Your Visit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProofOfVisitPage;

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase, signOut } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, MapPin, Phone, FileText, Calendar, Edit3, Save, X, LogOut, Briefcase, Camera, Award } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface UserActivity {
  id: string;
  type: 'business' | 'deal' | 'proof';
  title: string;
  status: string;
  created_at: string;
}

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    phone: '',
    location: '',
    bio: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchUserProfile();
      fetchUserActivities();
    }
  }, [user, loading, router]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data as UserProfile);
        setEditForm({
          display_name: data.display_name || user.user_metadata?.full_name || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchUserActivities = async () => {
    if (!user) return;

    try {
      const activities: UserActivity[] = [];

      const { data: businesses } = await supabase
        .from('businesses')
        .select('id, name, approved, created_at')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false });

      if (businesses) {
        businesses.forEach(biz => {
          activities.push({
            id: biz.id,
            type: 'business',
            title: biz.name,
            status: biz.approved ? 'Approved' : 'Pending',
            created_at: biz.created_at
          });
        });
      }

      const { data: proofs } = await supabase
        .from('proofs')
        .select('id, business_name, approved, created_at')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false });

      if (proofs) {
        proofs.forEach(proof => {
          activities.push({
            id: proof.id,
            type: 'proof',
            title: `Visit to ${proof.business_name}`,
            status: proof.approved ? 'Approved' : 'Pending',
            created_at: proof.created_at
          });
        });
      }

      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setActivities(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      await supabase.auth.updateUser({
        data: { full_name: editForm.display_name }
      });

      const { error } = await supabase
        .from('users')
        .update({
          display_name: editForm.display_name,
          phone: editForm.phone,
          location: editForm.location,
          bio: editForm.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        display_name: editForm.display_name,
        phone: editForm.phone,
        location: editForm.location,
        bio: editForm.bio
      } : null);

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="bg-gradient-hero py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/20 rounded w-1/3"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 -mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#1B4332]/10"></div>
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-[#1B4332]/10 rounded w-1/3"></div>
                <div className="h-4 bg-[#1B4332]/5 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Profile Not Found</h1>
          <p className="text-[#525252]">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const initials = profile.display_name
    ? profile.display_name.charAt(0).toUpperCase()
    : profile.email.charAt(0).toUpperCase();

  const activityIcon = (type: string) => {
    switch (type) {
      case 'business': return <Briefcase className="h-4 w-4" />;
      case 'proof': return <Camera className="h-4 w-4" />;
      case 'deal': return <Award className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="bg-gradient-hero py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-white/20">
            <User className="h-4 w-4" />
            My Profile
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white heading-display mb-2">
            {profile.display_name || 'Your Profile'}
          </h1>
          <p className="text-white/70">
            Manage your account and see your activity on ThikaBizHub
          </p>
        </div>
      </div>

      {/* Save Success Toast */}
      {saveSuccess && (
        <div className="fixed top-20 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Profile updated successfully!
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 ring-4 ring-white/30">
                  <span className="text-2xl font-bold text-white">{initials}</span>
                </div>
                <h2 className="text-xl font-bold text-white">{profile.display_name || 'No name set'}</h2>
                <p className="text-white/70 text-sm mt-1">{profile.email}</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mt-3 ${
                  profile.role === 'admin'
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                    : 'bg-white/10 text-white/90 border border-white/20'
                }`}>
                  {profile.role === 'admin' ? '⭐ Administrator' : '👤 Member'}
                </span>
              </div>

              {/* Profile Details */}
              <div className="p-6">
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-[#1B4332] mt-0.5 flex-shrink-0" />
                      <div>
                        <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wider">Phone</label>
                        <p className="text-[#1A1A1A] text-sm">{profile.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-[#1B4332] mt-0.5 flex-shrink-0" />
                      <div>
                        <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wider">Location</label>
                        <p className="text-[#1A1A1A] text-sm">{profile.location || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-[#1B4332] mt-0.5 flex-shrink-0" />
                      <div>
                        <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wider">Bio</label>
                        <p className="text-[#1A1A1A] text-sm">{profile.bio || 'No bio provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-[#1B4332] mt-0.5 flex-shrink-0" />
                      <div>
                        <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wider">Member Since</label>
                        <p className="text-[#1A1A1A] text-sm">{new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E5E5E5] space-y-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-[#1B4332] text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit Profile
                      </button>
                      <button
                        onClick={async () => { await signOut(); router.push('/'); }}
                        className="w-full bg-red-50 text-red-600 font-medium py-2.5 px-4 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Display Name</label>
                      <input
                        type="text"
                        value={editForm.display_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                        className="w-full px-3 py-2.5 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2.5 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all text-sm"
                        placeholder="+254..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Location</label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2.5 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all text-sm"
                        placeholder="e.g., Thika, Kiambu"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Bio</label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2.5 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all text-sm resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex-1 bg-[#1B4332] text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={saving}
                        className="flex-1 bg-[#1B4332]/5 text-[#1B4332] font-medium py-2.5 px-4 rounded-xl hover:bg-[#1B4332]/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1A1A1A]">My Activity</h3>
                <span className="text-sm text-[#737373]">{activities.length} {activities.length === 1 ? 'item' : 'items'}</span>
              </div>

              {activities.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1B4332]/10 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-[#1B4332]/40" />
                  </div>
                  <h4 className="text-lg font-bold text-[#1A1A1A] mb-2">No activity yet</h4>
                  <p className="text-[#525252] text-sm mb-6">Start by adding a business or sharing your visit experience</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href="/directory/add"
                      className="bg-[#1B4332] text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-[#2D6A4F] transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Briefcase className="h-4 w-4" />
                      Add Business
                    </a>
                    <a
                      href="/proof-of-visit"
                      className="bg-white text-[#1B4332] border-2 border-[#1B4332]/20 font-semibold py-2.5 px-6 rounded-xl hover:bg-[#1B4332]/5 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Share Experience
                    </a>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E5E5]">
                  {activities.map(activity => (
                    <div key={activity.id} className="px-6 py-4 hover:bg-[#FAFAF8] transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'business' ? 'bg-[#1B4332]/10 text-[#1B4332]' :
                            activity.type === 'proof' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' :
                            'bg-[#2D6A4F]/10 text-[#2D6A4F]'
                          }`}>
                            {activityIcon(activity.type)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-[#1A1A1A] text-sm truncate">{activity.title}</h4>
                            <p className="text-xs text-[#737373] mt-0.5">
                              {activity.type === 'business' && 'Business submission'}
                              {activity.type === 'deal' && 'Deal posted'}
                              {activity.type === 'proof' && 'Proof of visit shared'}
                            </p>
                            <p className="text-xs text-[#A3A3A3] mt-1">
                              {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          activity.status === 'Approved'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-[#D4AF37]/10 text-[#856404] border border-[#D4AF37]/20'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase, signOut } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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

      // Fetch businesses submitted by user
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

      // Fetch proof of visits submitted by user
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

      // Sort by date
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
      // Update Supabase user metadata
      await supabase.auth.updateUser({
        data: { full_name: editForm.display_name }
      });

      // Update users table
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
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-purple-600">
                    {profile.display_name ? profile.display_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{profile.display_name || 'No name set'}</h2>
                <p className="text-gray-600">{profile.email}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${profile.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                  }`}>
                  {profile.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <p className="text-gray-900">{profile.location || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                    <p className="text-gray-900">{new Date(profile.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={editForm.display_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 bg-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="flex-1 bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">My Activity</h3>

              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No activity yet</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/directory/add"
                      className="bg-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                    >
                      Add Business
                    </a>
                    <a
                      href="/proof-of-visit"
                      className="border-2 border-purple-600 text-purple-600 font-medium py-2 px-4 rounded-lg hover:bg-purple-600 hover:text-white transition-colors duration-300"
                    >
                      Share Experience
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`w-3 h-3 rounded-full ${activity.type === 'business'
                                ? 'bg-blue-500'
                                : activity.type === 'deal'
                                  ? 'bg-green-500'
                                  : 'bg-purple-500'
                              }`}></span>
                            <h4 className="font-medium text-gray-900">{activity.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            {activity.type === 'business' && 'Business submission'}
                            {activity.type === 'deal' && 'Deal posted'}
                            {activity.type === 'proof' && 'Proof of visit shared'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
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
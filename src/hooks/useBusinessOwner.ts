"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface OwnedBusiness {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  review_count: number;
  views: number;
  approved: boolean;
  is_premium: boolean;
  images: string[];
  created_at: string;
  owner_id?: string | null;
  location?: {
    county: string;
    town: string;
    address: string;
  } | null;
}

export function useBusinessOwner() {
  const { user, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState<OwnedBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOwnedBusinesses = async () => {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, category, description, rating, review_count, views, approved, is_premium, images, created_at, owner_id, location')
          .or(`owner_id.eq.${user.id},submitted_by.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBusinesses((data as OwnedBusiness[]) || []);
      } catch (error) {
        console.error('Error fetching owned businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnedBusinesses();
  }, [user, authLoading]);

  const isOwner = (businessId: string) => {
    return businesses.some(b => b.id === businessId);
  };

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, category, description, rating, review_count, views, approved, is_premium, images, created_at, owner_id, location')
        .or(`owner_id.eq.${user.id},submitted_by.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error refreshing businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  return { businesses, loading: loading || authLoading, isOwner, refresh, user };
}

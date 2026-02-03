import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('favorites')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setFavorites(data?.favorites || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (businessId: string) => {
    if (!user) {
      alert('Please login to save favorites');
      return false;
    }

    try {
      const isFavorite = favorites.includes(businessId);
      let newFavorites: string[];

      if (isFavorite) {
        newFavorites = favorites.filter(id => id !== businessId);
      } else {
        newFavorites = [...favorites, businessId];
      }

      const { error } = await supabase
        .from('users')
        .update({ favorites: newFavorites })
        .eq('id', user.id);

      if (error) throw error;
      setFavorites(newFavorites);
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };

  const isFavorite = (businessId: string) => favorites.includes(businessId);

  return { favorites, loading, toggleFavorite, isFavorite };
};

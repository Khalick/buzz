import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

// Export as a getter for lazy initialization
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  }
});

// Helper types for database tables
export type Tables = {
  users: {
    id: string;
    email: string;
    display_name: string | null;
    role: 'user' | 'admin';
    phone: string | null;
    location: string | null;
    bio: string | null;
    favorites: string[];
    created_at: string;
    updated_at: string;
  };
  businesses: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    whatsapp: string | null;
    address: string | null;
    website: string | null;
    coordinates: { latitude: number; longitude: number } | null;
    location: { county: string; town: string; address: string } | null;
    social_media: { facebook?: string; instagram?: string; twitter?: string };
    business_hours: Record<string, { open: string; close: string; closed: boolean }> | null;
    images: string[];
    views: number;
    rating: number;
    review_count: number;
    contact: { phone?: string; email?: string; whatsapp?: string } | null;
    approved: boolean;
    is_premium: boolean;
    owner_id: string | null;
    submitted_by: string | null;
    created_at: string;
    updated_at: string;
  };
  deals: {
    id: string;
    title: string;
    description: string | null;
    business_name: string;
    business_id: string | null;
    expiry_date: string | null;
    created_at: string;
  };
  proofs: {
    id: string;
    name: string;
    business_name: string;
    image_url: string;
    approved: boolean;
    submitted_by: string | null;
    created_at: string;
  };
  events: {
    id: string;
    title: string;
    description: string | null;
    business_id: string | null;
    business_name: string | null;
    location: string | null;
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    image_url: string | null;
    attendees: number;
    is_paid: boolean;
    price: number | null;
    created_at: string;
  };
  reviews: {
    id: string;
    business_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
  };
  reports: {
    id: string;
    business_id: string;
    reported_by: string;
    reporter_email: string | null;
    reason: string;
    description: string | null;
    status: 'pending' | 'reviewed' | 'resolved';
    created_at: string;
  };
  invites: {
    id: string;
    code: string;
    inviter_id: string;
    invitee_id: string | null;
    status: 'pending' | 'accepted' | 'expired';
    created_at: string;
  };
  notifications: {
    id: string;
    user_id: string;
    title: string;
    message: string | null;
    read: boolean;
    type: string | null;
    created_at: string;
  };
  categories: {
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
    created_at: string;
  };
};

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUpWithEmail = async (email: string, password: string) => {
  return supabase.auth.signUp({ email, password });
};

export const signInWithGoogle = async () => {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Storage helper functions
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
};

// Custom hook for auth state (to replace react-firebase-hooks)
export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
};

import { Store, ShoppingBag, Wrench, HeartPulse, Laptop, GraduationCap, Film, Wheat } from 'lucide-react';

export const CATEGORIES = [
  { name: 'Food & Restaurants', icon: '🍽️', slug: 'Food & Restaurants' },
  { name: 'Retail & Shopping', icon: '🛍️', slug: 'Retail & Shopping' },
  { name: 'Services', icon: '🔧', slug: 'Services' },
  { name: 'Healthcare', icon: '🏥', slug: 'Healthcare' },
  { name: 'Technology', icon: '💻', slug: 'Technology' },
  { name: 'Education', icon: '📚', slug: 'Education' },
  { name: 'Entertainment', icon: '🎬', slug: 'Entertainment' },
  { name: 'Agriculture', icon: '🌾', slug: 'Agriculture' },
];

export const FEATURES = [
  {
    title: 'Smart Directory',
    description: 'Find verified businesses with detailed contact information, operating hours, and customer reviews.',
    link: '/directory',
    linkText: 'Browse Directory',
  },
  {
    title: 'Exclusive Deals',
    description: 'Discover exclusive discounts and special offers from your favorite local businesses.',
    link: '/deals',
    linkText: 'View Deals',
  },
  {
    title: 'Local Events',
    description: 'Stay updated with upcoming events, workshops, and community gatherings in Thika.',
    link: '/events',
    linkText: 'Explore Events',
  },
];

export const STATS = [
  { value: '500+', label: 'Verified Businesses' },
  { value: '1,000+', label: 'Happy Customers' },
  { value: '50+', label: 'Daily Deals' },
  { value: '24/7', label: 'Support Available' },
];

export const PROOF_OF_VISIT_EMOJIS = ['🍽️', '☕', '🛍️', '💇'];

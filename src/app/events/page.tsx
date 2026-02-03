"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  business_id: string;
  business_name: string;
  location: string;
  event_date: string;
  start_time: string;
  end_time: string;
  image_url?: string;
  attendees?: number;
  is_paid: boolean;
  price?: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      let query = supabase.from('events').select('*');

      if (filter === 'upcoming') {
        query = query.gte('event_date', today).order('event_date', { ascending: true });
      } else if (filter === 'past') {
        query = query.lt('event_date', today).order('event_date', { ascending: false });
      } else {
        query = query.order('event_date', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDateParts = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' })
    };
  };

  const filters = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past Events' },
    { key: 'all', label: 'All Events' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="bg-gradient-hero py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-white/20">
            <Calendar className="h-4 w-4" />
            Community Events
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 heading-display">
            Local Events in Thika
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Discover workshops, meetups, and community gatherings happening near you
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all ${filter === f.key
                  ? 'bg-[#1B4332] text-white shadow-lg'
                  : 'bg-white text-[#525252] hover:bg-[#1B4332]/10 border border-[#E5E5E5]'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#1B4332]/20 border-t-[#1B4332] rounded-full animate-spin"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1B4332]/10 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-[#1B4332]/50" />
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">No Events Found</h3>
            <p className="text-[#525252] mb-8">Check back later for upcoming events in your area</p>
            <Link href="/directory" className="btn btn-primary btn-lg btn-pill">
              Browse Businesses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => {
              const dateParts = getDateParts(event.event_date);

              return (
                <div
                  key={event.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image or Date Display */}
                  <div className="relative h-48 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F]">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-5xl font-bold">{dateParts.day}</div>
                          <div className="text-lg uppercase tracking-wider opacity-80">{dateParts.month}</div>
                        </div>
                      </div>
                    )}

                    {/* Date Badge (when has image) */}
                    {event.image_url && (
                      <div className="absolute top-4 left-4 bg-white rounded-xl px-3 py-2 text-center shadow-lg">
                        <div className="text-xl font-bold text-[#1B4332]">{dateParts.day}</div>
                        <div className="text-xs uppercase text-[#525252]">{dateParts.month}</div>
                      </div>
                    )}

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4">
                      {event.is_paid ? (
                        <span className="bg-[#D4AF37] text-[#1B4332] px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          KES {event.price}
                        </span>
                      ) : (
                        <span className="bg-[#10B981] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-[#1B4332] font-semibold mb-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.event_date)}
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-2 group-hover:text-[#1B4332] transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-[#525252] text-sm mb-4 line-clamp-2">{event.description}</p>

                    <div className="space-y-2 text-sm text-[#525252] mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#1B4332]" />
                        <span>{event.start_time} - {event.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#1B4332]" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      {event.attendees && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#1B4332]" />
                          <span>{event.attendees} attending</span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/events/${event.id}`}
                      className="block w-full bg-[#1B4332] text-white px-4 py-3 rounded-xl hover:bg-[#2D6A4F] transition-colors text-sm font-medium text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

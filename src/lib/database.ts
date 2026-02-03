declare global {
  interface Window {
    gtag: (type: 'event', eventName: string, eventParams: object) => void;
  }
}

import { supabase } from './supabase';

// Performance monitoring
export function logPerformanceMetric(operation: string, duration: number) {
  console.log(`[Performance] ${operation}: ${duration}ms`);

  // In production, send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: operation,
      value: duration
    });
  }
}

// Database operation wrapper with performance monitoring
export async function withPerformanceMonitoring<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logPerformanceMetric(operation, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logPerformanceMetric(`${operation}_error`, duration);
    throw error;
  }
}

// Batch operations helper
export class BatchHelper {
  private operations: Array<() => Promise<void>> = [];
  private readonly batchSize: number;

  constructor(batchSize: number = 500) {
    this.batchSize = batchSize;
  }

  add(operation: () => Promise<void>) {
    this.operations.push(operation);
  }

  async execute(): Promise<void> {
    const batches = [];
    for (let i = 0; i < this.operations.length; i += this.batchSize) {
      batches.push(this.operations.slice(i, i + this.batchSize));
    }

    for (const batch of batches) {
      await Promise.all(batch.map(op => op()));
    }
  }

  clear() {
    this.operations = [];
  }
}

// Connection state monitoring
export function monitorConnectionState() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('Connection restored');
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost - using cached data');
    });
  }
}

// Helper to get user document
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Helper to get business document
export async function getBusiness(businessId: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (error) throw error;
  return data;
}
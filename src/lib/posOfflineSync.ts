import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { supabase } from '@/lib/supabase';

interface POSDatabase extends DBSchema {
  products: {
    key: string;
    value: {
      id: string;
      business_id: string;
      name: string;
      price: number;
      cost_price: number;
      stock_quantity: number;
      barcode?: string;
      sku?: string;
      category_id?: string;
      image_url?: string;
      is_active: boolean;
    };
    indexes: { 'by-barcode': string, 'by-category': string };
  };
  categories: {
    key: string;
    value: {
      id: string;
      business_id: string;
      name: string;
      color: string;
      icon: string;
      sort_order: number;
    };
  };
  syncQueue: {
    key: number;
    value: {
      id?: number; // auto-incremented
      business_id: string;
      cashier_id?: string;
      total_amount: number;
      subtotal: number;
      tax_amount: number;
      discount_amount: number;
      discount_type: string;
      payment_method: string;
      customer_name?: string;
      customer_phone?: string;
      notes?: string;
      receipt_number?: string;
      items: {
        pos_product_id: string;
        quantity: number;
        unit_price: number;
        total_price: number;
      }[];
      synced: boolean;
      created_at: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<POSDatabase>> | null = null;

export const initDB = () => {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<POSDatabase>('bizhub-pos', 2, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
          const prodStore = db.createObjectStore('products', { keyPath: 'id' });
          prodStore.createIndex('by-barcode', 'barcode');
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
        if (oldVersion < 2) {
          db.createObjectStore('categories', { keyPath: 'id' });
          // Note: we can't easily add index to existing store in upgrade without complex logic, 
          // but we can recreate or just rely on memory filtering for now.
        }
      },
    });
  }
  return dbPromise;
};

// 1. Refresh local products and categories from Supabase
export async function syncProductsDown(businessId: string) {
  const db = await initDB();
  if (!db || typeof window === 'undefined' || !navigator.onLine) return;

  try {
    // Fetch Products
    const { data: products, error: pError } = await supabase
      .from('pos_products')
      .select('*')
      .eq('business_id', businessId);

    if (pError) throw pError;
    
    // Fetch Categories
    const { data: categories, error: cError } = await supabase
      .from('pos_categories')
      .select('*')
      .eq('business_id', businessId);

    if (cError) throw cError;

    if (products) {
      const tx = db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      await store.clear();
      for (const prod of products) {
        await store.put(prod);
      }
      await tx.done;
    }

    if (categories) {
      const tx = db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');
      await store.clear();
      for (const cat of categories) {
        await store.put(cat);
      }
      await tx.done;
    }
  } catch (e) {
    console.error('Failed to sync products/categories down:', e);
  }
}

// 2. Fetch local products
export async function getLocalProducts() {
  const db = await initDB();
  if (!db) return [];
  return db.getAll('products');
}

// 2b. Fetch local categories
export async function getLocalCategories() {
  const db = await initDB();
  if (!db) return [];
  return db.getAll('categories');
}

// 3. Queue an order locally if offline, or attempt directly
export async function queueOrder(order: POSDatabase['syncQueue']['value']) {
  const db = await initDB();
  if (!db) return;
  await db.add('syncQueue', order);
  
  // Try to sync up immediately
  if (navigator.onLine) {
    await syncOrdersUp();
  } else {
    // Register for background sync so the SW retries when connectivity returns
    // This works even if the user closes the tab
    try {
      const registration = await navigator.serviceWorker?.ready;
      if (registration && 'sync' in registration) {
        await (registration as any).sync.register('pos-order-sync');
        console.log('[POS] Background sync registered: pos-order-sync');
      }
    } catch (e) {
      console.warn('[POS] Background sync registration failed (will retry on online event):', e);
    }
  }
}

// 4. Push queued orders to Supabase
export async function syncOrdersUp() {
  const db = await initDB();
  if (!db || typeof window === 'undefined' || !navigator.onLine) return;

  const tx = db.transaction('syncQueue', 'readwrite');
  const store = tx.objectStore('syncQueue');
  const pendingOrders = await store.getAll();

  if (pendingOrders.length === 0) return;

  for (const order of pendingOrders) {
    try {
      // Create main order record
      const { data: insertedOrder, error: orderError } = await supabase
        .from('pos_orders')
        .insert({
          business_id: order.business_id,
          cashier_id: order.cashier_id,
          total_amount: order.total_amount,
          subtotal: order.subtotal,
          tax_amount: order.tax_amount,
          discount_amount: order.discount_amount,
          discount_type: order.discount_type,
          payment_method: order.payment_method,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          notes: order.notes,
          receipt_number: order.receipt_number
        })
        .select()
        .maybeSingle();
        
      if (orderError) throw orderError;

      // Add order items
      if (insertedOrder && order.items.length > 0) {
        const itemsToInsert = order.items.map(item => ({
          pos_order_id: insertedOrder.id,
          pos_product_id: item.pos_product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));

        const { error: itemError } = await supabase
          .from('pos_order_items')
          .insert(itemsToInsert);

        if (itemError) throw itemError;
        
        // Decrement stock for the items
        for(const item of order.items) {
            const { data: p } = await supabase.from('pos_products').select('stock_quantity').eq('id', item.pos_product_id).maybeSingle();
            if(p) {
               await supabase.from('pos_products').update({stock_quantity: Math.max(0, (p.stock_quantity || 0) - item.quantity)}).eq('id', item.pos_product_id);
            }
        }
      }

      // successfully synced, remove from local queue
      if (order.id) {
        await store.delete(order.id);
      }
    } catch (e) {
      console.error('Failed to sync order up, retrying later:', e);
      // We do not delete from store, so it will be retried on next sync
    }
  }
  await tx.done;
}

// 5. Setup event listeners
export function initSyncListeners() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      syncOrdersUp();
    });
  }
}

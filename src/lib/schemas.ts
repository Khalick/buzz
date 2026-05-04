import { z } from 'zod';

export const merchantRequestSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name is too long'),
  category: z.string().min(1, 'Category is required'),
  contact_phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Please enter a valid phone number (e.g. 0712345678 or +254712345678)'),
});

const phoneSchema = z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number format').optional().nullable();

export const businessSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional().nullable(),
  category: z.string().max(80, 'Category cannot exceed 80 characters'),
  location: z.object({
    county: z.string().min(1, 'County is required').max(80, 'County name too long'),
    town: z.string().max(80, 'Town name too long').optional().nullable(),
    address: z.string().max(200, 'Address too long').optional().nullable(),
  }),
  contact: z.object({
    phone: phoneSchema,
    whatsapp: phoneSchema,
    email: z.string().email('Invalid email address').optional().nullable(),
  }).refine(data => data.phone || data.email, {
    message: 'At least one contact method (phone or email) is required',
    path: ['phone'],
  }),
  website: z.string().url('Invalid website URL').optional().nullable(),
  images: z.array(z.string().url('Images must be valid URLs').startsWith('https://', 'Images must use HTTPS')).max(20, 'Maximum 20 images allowed').optional().nullable(),
});

// We can infer types from Zod directly
export type MerchantRequestInput = z.infer<typeof merchantRequestSchema>;
export type BusinessSubmissionInput = z.infer<typeof businessSubmissionSchema>;

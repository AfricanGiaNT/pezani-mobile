import { z } from 'zod';

/**
 * Validation schemas for forms using Zod
 */

// Property listing validation schema
export const propertySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1500, 'Description must be 1500 characters or less'),
  
  location: z
    .string()
    .min(1, 'Location is required'),
  
  price: z
    .number()
    .min(5000, 'Minimum rent is MWK 5,000')
    .max(999999999, 'Maximum rent is MWK 999,999,999'),
  
  viewing_fee: z
    .number()
    .min(0, 'Viewing fee cannot be negative')
    .max(999999, 'Maximum viewing fee is MWK 999,999'),
  
  bedrooms: z
    .number()
    .min(0, 'Bedrooms cannot be negative')
    .max(20, 'Maximum 20 bedrooms'),
  
  bathrooms: z
    .number()
    .min(0, 'Bathrooms cannot be negative')
    .max(20, 'Maximum 20 bathrooms'),
  
  property_type: z.enum(['house', 'apartment', 'room', 'shop', 'office'], {
    message: 'Please select a valid property type'
  }),
  
  amenities: z.array(z.string()).default([]).optional(),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

// Malawi locations
export const malawiLocations = [
  'Area 2, Lilongwe',
  'Area 3, Lilongwe',
  'Area 4, Lilongwe',
  'Area 9, Lilongwe',
  'Area 10, Lilongwe',
  'Area 11, Lilongwe',
  'Area 12, Lilongwe',
  'Area 13, Lilongwe',
  'Area 14, Lilongwe',
  'Area 15, Lilongwe',
  'Area 18, Lilongwe',
  'Area 23, Lilongwe',
  'Area 25, Lilongwe',
  'Area 43, Lilongwe',
  'Area 47, Lilongwe',
  'Area 49, Lilongwe',
  'Kanengo, Lilongwe',
  'Kamboni, Lilongwe',
  'Old Town, Lilongwe',
  'City Centre, Lilongwe',
  'Blantyre City Centre',
  'Limbe, Blantyre',
  'Ndirande, Blantyre',
  'Chilomoni, Blantyre',
  'Sunnyside, Blantyre',
  'Mzuzu',
  'Zomba',
  'Mangochi',
  'Salima',
  'Kasungu',
];

// Available amenities
export const availableAmenities = [
  'WiFi',
  'Parking',
  'Generator',
  'Water Tank',
  'Garden',
  'Security Guard',
  'CCTV',
  'Furnished',
  'Air Conditioning',
  'Kitchen Appliances',
  'Swimming Pool',
  'Gym',
  'Backup Water',
  'Solar Power',
  'Balcony',
  'Fireplace',
];

// Property types
export const propertyTypes = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'room', label: 'Room' },
  { value: 'shop', label: 'Shop' },
  { value: 'office', label: 'Office' },
] as const;

// Phone number validation for Malawi
export const phoneSchema = z
  .string()
  .regex(/^\+2659\d{8}$/, 'Phone must be +265 followed by 9 digits');

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address');

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Sign up validation schema
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be 100 characters or less'),
  phone: phoneSchema,
  role: z.enum(['tenant', 'landlord', 'agent'], {
    message: 'Please select a valid role'
  }),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Profile update validation schema
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be 100 characters or less'),
  phone: phoneSchema,
  payout_method: z.enum(['mobile_money', 'bank']).optional(),
  payout_provider: z.string().optional(),
  payout_account_number: z.string().optional(),
  payout_account_name: z.string().optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Password change validation schema
export const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: passwordSchema,
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

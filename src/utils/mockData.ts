/**
 * Mock data for development and testing
 * This will be replaced with real data from Supabase
 */

export interface MockProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  viewing_fee: number;
  bedrooms: number;
  bathrooms: number;
  property_type: 'house' | 'apartment' | 'room' | 'shop' | 'office';
  status: 'available' | 'unavailable';
  images: string[];
  description: string;
  amenities: string[];
  view_count: number;
  save_count: number;
  created_at: string;
}

export const mockProperties: MockProperty[] = [
  {
    id: '1',
    title: 'Modern 3 Bedroom House',
    location: 'Area 47, Lilongwe',
    price: 150000,
    viewing_fee: 5000,
    bedrooms: 3,
    bathrooms: 2,
    property_type: 'house',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
    description: 'Beautiful modern house with spacious rooms and a lovely garden. Perfect for families.',
    amenities: ['WiFi', 'Parking', 'Generator', 'Water Tank', 'Garden', 'Security'],
    view_count: 124,
    save_count: 18,
    created_at: '2024-11-20T10:00:00Z',
  },
  {
    id: '2',
    title: '2 Bedroom Apartment',
    location: 'Area 43, Lilongwe',
    price: 80000,
    viewing_fee: 3000,
    bedrooms: 2,
    bathrooms: 1,
    property_type: 'apartment',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    description: 'Cozy apartment in a secure building with modern amenities.',
    amenities: ['WiFi', 'Parking', 'Security', 'Water Tank'],
    view_count: 89,
    save_count: 12,
    created_at: '2024-11-21T14:30:00Z',
  },
  {
    id: '3',
    title: 'Spacious 4 Bedroom House',
    location: 'Kanengo, Lilongwe',
    price: 200000,
    viewing_fee: 8000,
    bedrooms: 4,
    bathrooms: 3,
    property_type: 'house',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    description: 'Large family home with modern finishes and plenty of outdoor space.',
    amenities: ['WiFi', 'Parking', 'Generator', 'Water Tank', 'Garden', 'Security', 'CCTV'],
    view_count: 156,
    save_count: 24,
    created_at: '2024-11-19T09:15:00Z',
  },
  {
    id: '4',
    title: 'Single Room for Rent',
    location: 'Area 18, Lilongwe',
    price: 25000,
    viewing_fee: 1000,
    bedrooms: 1,
    bathrooms: 1,
    property_type: 'room',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800'],
    description: 'Affordable single room perfect for students or young professionals.',
    amenities: ['WiFi', 'Security'],
    view_count: 67,
    save_count: 8,
    created_at: '2024-11-22T16:45:00Z',
  },
  {
    id: '5',
    title: 'Commercial Shop Space',
    location: 'City Centre, Lilongwe',
    price: 300000,
    viewing_fee: 10000,
    bedrooms: 0,
    bathrooms: 1,
    property_type: 'shop',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
    description: 'Prime location shop space ideal for retail business.',
    amenities: ['Parking', 'Security', 'CCTV'],
    view_count: 203,
    save_count: 31,
    created_at: '2024-11-18T11:20:00Z',
  },
  {
    id: '6',
    title: 'Executive 3 Bedroom Apartment',
    location: 'Area 10, Lilongwe',
    price: 180000,
    viewing_fee: 7000,
    bedrooms: 3,
    bathrooms: 2,
    property_type: 'apartment',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
    description: 'Luxury apartment with stunning views and premium finishes.',
    amenities: ['WiFi', 'Parking', 'Generator', 'Water Tank', 'Security', 'CCTV', 'Furnished', 'Air Conditioning'],
    view_count: 178,
    save_count: 29,
    created_at: '2024-11-17T08:00:00Z',
  },
  {
    id: '7',
    title: 'Cozy 2 Bedroom House',
    location: 'Area 25, Lilongwe',
    price: 95000,
    viewing_fee: 4000,
    bedrooms: 2,
    bathrooms: 1,
    property_type: 'house',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    description: 'Charming house with a small garden, perfect for a small family.',
    amenities: ['Parking', 'Water Tank', 'Garden'],
    view_count: 92,
    save_count: 14,
    created_at: '2024-11-23T13:10:00Z',
  },
  {
    id: '8',
    title: 'Office Space for Rent',
    location: 'Old Town, Lilongwe',
    price: 250000,
    viewing_fee: 8000,
    bedrooms: 0,
    bathrooms: 2,
    property_type: 'office',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'],
    description: 'Professional office space with meeting rooms and ample parking.',
    amenities: ['WiFi', 'Parking', 'Generator', 'Security', 'CCTV', 'Air Conditioning'],
    view_count: 145,
    save_count: 22,
    created_at: '2024-11-16T15:30:00Z',
  },
  {
    id: '9',
    title: 'Furnished 1 Bedroom Apartment',
    location: 'Area 47, Lilongwe',
    price: 120000,
    viewing_fee: 5000,
    bedrooms: 1,
    bathrooms: 1,
    property_type: 'apartment',
    status: 'unavailable',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    description: 'Fully furnished apartment, move in ready with all appliances included.',
    amenities: ['WiFi', 'Parking', 'Security', 'Furnished', 'Kitchen Appliances'],
    view_count: 234,
    save_count: 45,
    created_at: '2024-11-15T10:45:00Z',
  },
  {
    id: '10',
    title: '5 Bedroom Mansion',
    location: 'Kamboni, Lilongwe',
    price: 450000,
    viewing_fee: 15000,
    bedrooms: 5,
    bathrooms: 4,
    property_type: 'house',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
    description: 'Luxurious mansion with swimming pool, large garden, and premium finishes throughout.',
    amenities: ['WiFi', 'Parking', 'Generator', 'Water Tank', 'Garden', 'Security', 'CCTV', 'Furnished', 'Air Conditioning'],
    view_count: 312,
    save_count: 56,
    created_at: '2024-11-14T12:00:00Z',
  },
];

// Featured properties (first 6)
export const featuredProperties = mockProperties.slice(0, 6);

// Recent properties (most recent first)
export const recentProperties = [...mockProperties].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);


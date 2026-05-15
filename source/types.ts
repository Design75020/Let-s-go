export type DomainType = 'landing' | 'app' | 'merchant' | 'driver' | 'admin' | 'crm' | 'saas' | 'agent';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: DomainType | 'client';
}

export interface Restaurant {
  id: string;
  name: string;
  ownerId: string;
  category: string;
  rating: number;
  status: 'open' | 'closed';
  image?: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  image?: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  restaurantId: string;
  restaurantName: string;
  items: any[];
  total: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: any;
  updatedAt?: any;
  driverId?: string;
  driverName?: string;
  driverLocation?: {
    lat: number;
    lng: number;
  };
  tip?: number;
}

export type DomainType = 'landing' | 'app' | 'merchant' | 'driver' | 'admin' | 'crm' | 'saas' | 'agent';

export interface KYCData {
  idCardUrl?: string;
  insuranceUrl?: string;
  kbizUrl?: string;
  registrationUrl?: string; // carte grise for drivers
  driverLicenseUrl?: string;
  selfieUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: DomainType | 'client';
  kyc?: KYCData;
  available?: boolean; // for drivers
  location?: {
    lat: number;
    lng: number;
    updatedAt: any;
  };
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
  address?: string;
  hours?: {
    [key: string]: { open: string, close: string };
  };
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  image?: string;
  description?: string;
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

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  phone?: string;
  image?: string;
  profilePicture?: string; // Add profilePicture field from backend
  healthProfile?: any;
  subscriptionData?: any;
  purchasedServices?: any[];
}

export interface SubscriptionWithExpiration {
  _id: string;
  planId: string;
  planName: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  isExpired: boolean;
  availableSessions?: {
    total: number | 'unlimited';
    used: number;
    remaining: number | 'unlimited';
    percentageUsed: number;
  };
  sessionInfo?: {
    totalAllowed: number | 'unlimited';
    sessionsUsed: number;
    sessionsRemaining: number | 'unlimited';
    bookingsMade: number;
  };
  purchasedServices?: ServiceWithExpiration[];
  finalAmount?: number;
  discountAmount?: number;
  couponCode?: string;
}

export interface ServiceWithExpiration {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    price: number;
    validity: number;
    sessions: number;
  };
  serviceName?: string;
  therapistId?: string;
  therapistName?: string;
  date?: string;
  time?: string;
  status?: string;
  sessionCreated?: boolean;
  amount?: number;
  isExpired: boolean;
  expiryDate: string;
  purchaseDate: string;
  serviceSessionInfo?: {
    total: number | 'unlimited';
    used: number;
    remaining: number | 'unlimited';
    percentageUsed: number;
  };
  finalAmount?: number;
  discountAmount?: number;
  couponCode?: string;
}
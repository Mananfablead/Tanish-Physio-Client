/**
 * IP-based Location Detection Service
 * Calls your own backend API which uses multiple free IP geolocation services
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Cache for IP location data (expires after 5 minutes)
let ipLocationCache: {
  data: IPLocationData | null;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface IPLocationData {
  // Standard fields (from all APIs)
  status?: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip?: string;
  lat: number;
  lon: number;
  timezone: string;
  isp?: string;
  org?: string;
  as?: string;
  query?: string;
  
  // Compatibility fields (for existing code)
  country_code: string;
  country_name: string;
  latitude: number;
  longitude: number;
  currency: string | null;
}

export interface IPResponse {
  success: boolean;
  message: string;
  data: IPLocationData | null;
  error?: string;
}

export interface CountryResponse {
  success: boolean;
  message: string;
  data: {
    country_code: string;
  } | null;
  error?: string;
}

/**
 * Get user's location data from their IP address via your backend API
 * @returns Promise<IPLocationData | null>
 */
export const getIPLocation = async (): Promise<IPLocationData | null> => {
  try {
    console.log('🌍 Fetching IP location from your backend API...');
    
    const response = await axios.get<IPResponse>(`${API_BASE_URL}/ip-location/`);
    
    if (response.data.success && response.data.data) {
      console.log('[IP Location] Detected:', {
        country: response.data.data.country_name,
        country_code: response.data.data.country_code,
        city: response.data.data.city,
        timezone: response.data.data.timezone,
      });
      return response.data.data;
    } else {
      console.warn('[IP Location] Failed to detect location:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('[IP Location] Error detecting location:', error);
    return null;
  }
};

/**
 * Get cached IP location data (valid for 5 minutes)
 * This prevents excessive API calls when multiple components need location
 * @returns Promise<IPLocationData | null>
 */
export const getCachedIPLocation = async (): Promise<IPLocationData | null> => {
  // Check if we have valid cached data
  if (ipLocationCache && ipLocationCache.data) {
    const now = Date.now();
    const cacheAge = now - ipLocationCache.timestamp;
    
    if (cacheAge < CACHE_DURATION) {
      console.log('[Cached IP Location] Using cached data:', {
        age: Math.round(cacheAge / 1000) + 's',
        city: ipLocationCache.data.city,
        country: ipLocationCache.data.country_name,
      });
      return ipLocationCache.data;
    } else {
      console.log('[Cached IP Location] Cache expired, fetching fresh data...');
      ipLocationCache = null;
    }
  }
  
  // Fetch fresh data
  const locationData = await getIPLocation();
  
  if (locationData) {
    // Cache the result
    ipLocationCache = {
      data: locationData,
      timestamp: Date.now(),
    };
    console.log('[Cached IP Location] Data cached successfully');
  }
  
  return locationData;
};

/**
 * Clear the IP location cache (useful for testing or manual refresh)
 */
export const clearIPLocationCache = (): void => {
  console.log('[Cached IP Location] Cache cleared manually');
  ipLocationCache = null;
};

/**
 * Get a friendly location string from IP location data
 * @param locationData - IP location data
 * @returns string - Friendly location string (e.g., "Mumbai, India")
 */
export const getFriendlyLocation = (locationData: IPLocationData | null): string => {
  if (!locationData) return 'Unknown';
  
  const parts: string[] = [];
  if (locationData.city) parts.push(locationData.city);
  if (locationData.region && locationData.region !== locationData.city) parts.push(locationData.region);
  if (locationData.country_name) parts.push(locationData.country_name);
  
  return parts.join(', ') || 'Unknown';
};

/**
 * Get only country code from IP address via your backend API
 * @returns Promise<string | null> - Country code (e.g., "IN", "US")
 */
export const getCountryFromIP = async (): Promise<string | null> => {
  try {
    console.log('🏳️ Fetching country from your backend API...');
    
    const response = await axios.get<CountryResponse>(`${API_BASE_URL}/ip-location/country`);
    
    if (response.data.success && response.data.data) {
      const countryCode = response.data.data.country_code;
      console.log('[Country] Detected:', countryCode);
      return countryCode;
    } else {
      console.warn('[Country] Failed to detect:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('[Country] Error detecting country:', error);
    return null;
  }
};

/**
 * Get timezone from IP address only (lighter version)
 * @returns Promise<string | null> - Timezone string (e.g., "Asia/Kolkata")
 */
export const getTimezoneFromIP = async (): Promise<string | null> => {
  try {
    const locationData = await getIPLocation();
    
    if (locationData?.timezone) {
      console.log('[Timezone] Detected:', locationData.timezone);
      return locationData.timezone;
    }
    
    return null;
  } catch (error) {
    console.error('[Timezone] Error detecting timezone:', error);
    return null;
  }
};

// Country detection utility
// This will detect the user's country using IP-based geolocation or user profile

interface CountryInfo {
  country: string;
  currency: '₹' | '$';
  countryCode: string;
}

// Get country from user profile (if available)
const getCountryFromProfile = (): string | null => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.country || userData.location?.country || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Get country from IP-based geolocation using a free service
const getCountryFromIP = async (): Promise<string | null> => {
  try {
    // Using ipapi.co - free tier allows 1000 requests per day
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Failed to fetch IP geolocation');
    }
    
    const data = await response.json();
    return data.country_name || data.country || null;
  } catch (error) {
    console.warn('Failed to detect country from IP:', error);
    return null;
  }
};

// Get country from browser language settings as fallback
const getCountryFromLanguage = (): string => {
  const language = navigator.language || (navigator as any).userLanguage;
  const countryCode = language.split('-')[1];
  
  // Map common country codes to full country names
  const countryMap: Record<string, string> = {
    'IN': 'India',
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    // Add more as needed
  };
  
  return countryMap[countryCode] || 'United States'; // Default to US
};

// Main function to detect country
export const detectUserCountry = async (): Promise<CountryInfo> => {
  // 1. Check if country is stored in user profile
  let country = getCountryFromProfile();
  
  // 2. If not available, try IP-based detection
  if (!country) {
    country = await getCountryFromIP();
  }
  
  // 3. Fallback to browser language
  if (!country) {
    country = getCountryFromLanguage();
  }
  
  // Determine currency based on country
  const currency: '₹' | '$' = country === 'India' ? '₹' : '$';
  const countryCode = country === 'India' ? 'IN' : 'US'; // Simplified
  
  return {
    country,
    currency,
    countryCode
  };
};

// Get country info synchronously (for cases where we can't wait for async operation)
export const getCountryInfoSync = (): CountryInfo => {
  const country = getCountryFromProfile() || getCountryFromLanguage();
  const currency: '₹' | '$' = country === 'India' ? '₹' : '$';
  const countryCode = country === 'India' ? 'IN' : 'US';
  
  return {
    country,
    currency,
    countryCode
  };
};

// Check if user is from India
export const isUserFromIndia = (): boolean => {
  const countryInfo = getCountryInfoSync();
  return countryInfo.country === 'India';
};
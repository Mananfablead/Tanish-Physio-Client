// Country detection utility
// This will detect the user's country using IP-based geolocation or user profile

interface CountryInfo {
  country: string;
  currency: "₹" | "$";
  countryCode: string;
}

// Cache for country detection to prevent excessive API calls
let cachedCountryInfo: CountryInfo | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Get country from user profile (if available)
const getCountryFromProfile = (): string | null => {
  const user = localStorage.getItem("user");
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

// Get country from IP-based geolocation using your backend API
const getCountryFromIP = async (): Promise<string | null> => {
  try {
    // Import the service that calls your backend API
    const { getCountryFromIP: fetchCountryFromBackend } = await import('../services/ipLocationService');
    
    const countryCode = await fetchCountryFromBackend();
    
    if (countryCode) {
      // Convert country code to country name if needed
      const countryNames: Record<string, string> = {
        IN: 'India',
        US: 'United States',
        GB: 'United Kingdom',
        AU: 'Australia',
        CA: 'Canada',
        // Add more as needed
      };
      
      return countryNames[countryCode] || countryCode;
    }
    
    return null;
  } catch (error) {
    console.warn("Failed to detect country from IP:", error);
    return null;
  }
};

// Get country from browser language settings as fallback
const getCountryFromLanguage = (): string => {
  const language = navigator.language || (navigator as any).userLanguage;
  const countryCode = language.split("-")[1];

  // Map common country codes to full country names
  const countryMap: Record<string, string> = {
    IN: "India",
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    JP: "Japan",
    // Add more as needed
  };

  return countryMap[countryCode] || "India"; // Default to India
};

// Main function to detect country
export const detectUserCountry = async (): Promise<CountryInfo> => {
  // Check if we have a cached result that's still valid
  const now = Date.now();
  if (
    cachedCountryInfo &&
    cacheTimestamp &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return cachedCountryInfo;
  }

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
  const currency: "₹" | "$" = country === "India" ? "₹" : "$";
  const countryCode = country === "India" ? "IN" : "US"; // Simplified

  // Cache the result
  const result: CountryInfo = {
    country,
    currency,
    countryCode,
  };

  cachedCountryInfo = result;
  cacheTimestamp = now;

  return result;
};

// Get country info synchronously (for cases where we can't wait for async operation)
export const getCountryInfoSync = (): CountryInfo => {
  // Check if we have a cached result that's still valid
  const now = Date.now();
  if (
    cachedCountryInfo &&
    cacheTimestamp &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return cachedCountryInfo;
  }

  const country = getCountryFromProfile() || getCountryFromLanguage();
  const currency: "₹" | "$" = country === "India" ? "₹" : "$";
  const countryCode = country === "India" ? "IN" : "US";

  // Cache the result
  const result: CountryInfo = {
    country,
    currency,
    countryCode,
  };

  cachedCountryInfo = result;
  cacheTimestamp = now;

  return result;
};

// Check if user is from India
export const isUserFromIndia = (): boolean => {
  const countryInfo = getCountryInfoSync();
  return countryInfo.country === "India";
};

// Clear the cached country info (useful when user logs in/out or changes location)
export const clearCountryCache = (): void => {
  cachedCountryInfo = null;
  cacheTimestamp = null;
};

/**
 * IP-based Location Detection Service
 * Uses ipapi.co API to detect user's location and timezone based on their IP address
 */

export interface IPLocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  languages: string;
  asn: string;
  org: string;
}

/**
 * Get user's location data from their IP address
 * @returns Promise<IPLocationData>
 */
export const getIPLocation = async (): Promise<IPLocationData | null> => {
  try {
    const response = await fetch("https://ipwho.is/");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: IPLocationData = await response.json();

    console.log("[IP Location] Detected:", {
      city: data.city,
      country: data.country,
      timezone: data.timezone,
      utc_offset: data.utc_offset,
    });

    return data;
  } catch (error) {
    console.error("[IP Location] Error detecting location:", error);
    return null;
  }
};

/**
 * Get timezone from IP address only (lighter version)
 * @returns Promise<string | null> - Timezone string (e.g., "America/New_York")
 */
export const getTimezoneFromIP = async (): Promise<string | null> => {
  try {
    const locationData = await getIPLocation();
    return locationData?.timezone || null;
  } catch (error) {
    console.error("[IP Timezone] Error:", error);
    return null;
  }
};

/**
 * Get user's IP address only
 * @returns Promise<string | null>
 */
export const getIPAddress = async (): Promise<string | null> => {
  try {
    const locationData = await getIPLocation();
    return locationData?.ip || null;
  } catch (error) {
    console.error("[IP Address] Error:", error);
    return null;
  }
};

/**
 * Format timezone offset for display (e.g., "-05:00" → "UTC-5")
 */
export const formatUTCOffset = (offset: string): string => {
  try {
    // Remove colon if present (e.g., "-0500" or "-05:00")
    const cleanOffset = offset.replace(":", "");
    const sign = cleanOffset.startsWith("-") ? "-" : "+";
    const hours = parseInt(cleanOffset.slice(1, 3)) || 0;
    const minutes = parseInt(cleanOffset.slice(3, 5)) || 0;

    const totalHours = hours + minutes / 60;
    return `UTC${sign}${totalHours}`;
  } catch {
    return "UTC";
  }
};

/**
 * Create a friendly location string from IP data
 * @param data - IP location data
 * @returns Formatted string (e.g., "New York, United States")
 */
export const getFriendlyLocation = (data: IPLocationData | null): string => {
  if (!data) return "Unknown location";

  const parts = [];
  if (data.city) parts.push(data.city);
  if (data.region && data.region !== data.city) parts.push(data.region);
  if (data.country) parts.push(data.country);

  return parts.join(", ") || "Unknown location";
};

/**
 * Cache for IP location data (prevents multiple API calls in same session)
 */
let cachedIPLocation: IPLocationData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached IP location data (auto-refreshes after cache expires)
 * @param forceRefresh - Force refresh even if cache is valid
 * @returns Promise<IPLocationData | null>
 */
export const getCachedIPLocation = async (
  forceRefresh = false,
): Promise<IPLocationData | null> => {
  const now = Date.now();

  // Return cached data if still valid and not forcing refresh
  if (
    !forceRefresh &&
    cachedIPLocation &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    console.log("[IP Location] Using cached data");
    return cachedIPLocation;
  }

  // Fetch fresh data
  console.log("[IP Location] Fetching fresh data...");
  const freshData = await getIPLocation();

  if (freshData) {
    cachedIPLocation = freshData;
    cacheTimestamp = now;
  }

  return freshData;
};

/**
 * Clear the IP location cache
 */
export const clearIPLocationCache = () => {
  cachedIPLocation = null;
  cacheTimestamp = 0;
  console.log("[IP Location] Cache cleared");
};

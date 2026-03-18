/**
 * Detects user's country based on IP address
 * Returns country code (e.g., 'US', 'IN', etc.)
 */
export const detectUserCountry = async (): Promise<string | null> => {
  try {
    // Using ipapi.co for IP-based geolocation (free, no API key required)
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error("Failed to fetch location");
    }
    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.warn("Could not detect user location:", error);
    return null;
  }
};

/**
 * Determines the appropriate currency based on user's location
 * Returns currency code (e.g., 'USD', 'INR')
 * Logic: India -> INR, All other countries -> USD
 */
export const getCurrencyByLocation = async (): Promise<string> => {
  try {
    const countryCode = await detectUserCountry();

    if (!countryCode) {
      // Default to INR if detection fails (safe default for Indian business)
      return "INR";
    }

    // Simple logic: India gets INR, everyone else gets USD
    if (countryCode === "IN") {
      return "INR"; // India -> INR
    } else {
      return "USD"; // All other countries -> USD
    }
  } catch (error) {
    console.error("Error determining currency:", error);
    return "INR"; // Fallback to INR
  }
};

/**
 * Synchronous version using stored/known country
 * Logic: India -> INR, All other countries -> USD
 */
export const getCurrencySync = (countryCode: string | null): string => {
  if (!countryCode) {
    return "INR";
  }

  // Simple logic: India gets INR, everyone else gets USD
  if (countryCode === "IN") {
    return "INR"; // India -> INR
  } else {
    return "USD"; // All other countries -> USD
  }
};

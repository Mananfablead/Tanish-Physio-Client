import { getCountryFromIP } from "../services/ipLocationService";

/**
 * Detects user's country based on IP address
 * Returns country code (e.g., 'US', 'IN', etc.)
 * Uses your own backend API with multiple fallback services
 */
export const detectUserCountry = async (): Promise<string | null> => {
  try {
    console.log("🌐 Fetching IP location from your backend API...");

    // Use your backend API which handles multiple IP geolocation services
    const countryCode = await getCountryFromIP();

    if (countryCode) {
      console.log("✅ Successfully detected country:", countryCode);
      return countryCode;
    }

    console.warn("⚠️ Country detection failed");
    return null;
  } catch (error) {
    console.error("❌ Could not detect user location:", error);
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
    console.log("🔍 Starting currency detection...");
    const countryCode = await detectUserCountry();
    console.log("🏷️ Detected country code:", countryCode);

    if (!countryCode) {
      console.warn("⚠️ No country code detected, defaulting to INR");
      // Default to INR if detection fails (safe default for Indian business)
      return "INR";
    }

    // Simple logic: India gets INR, everyone else gets USD
    if (countryCode === "IN") {
      console.log("✅ Country is India, returning INR");
      return "INR"; // India -> INR
    } else {
      console.log(`✅ Country is ${countryCode}, returning USD`);
      return "USD"; // All other countries -> USD
    }
  } catch (error) {
    console.error("❌ Error determining currency:", error);
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

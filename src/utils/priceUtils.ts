// Price formatting utility for multi-currency support
// Uses country detection to show appropriate currency (INR for India, USD for others)

import {
  detectUserCountry,
  getCountryInfoSync,
} from "@/utils/countryDetection";

interface PriceInfo {
  amount: number;
  currency: "₹" | "$";
  currencyCode: "INR" | "USD";
  formatted: string;
}

/**
 * Get price based on user's location
 * @param priceINR - Price in Indian Rupees
 * @param priceUSD - Price in US Dollars
 * @returns PriceInfo object with formatted price
 */
export const getPriceByLocation = async (
  priceINR: number,
  priceUSD: number,
): Promise<PriceInfo> => {
  try {
    const countryInfo = await detectUserCountry();
    const isInIndia = countryInfo.country === "India";
    const hasValidUSD = typeof priceUSD === "number" && priceUSD > 0;
    const shouldUseINR = isInIndia || !hasValidUSD;

    const amount = shouldUseINR ? priceINR : priceUSD;
    const currency = shouldUseINR ? "₹" : "$";
    const currencyCode = shouldUseINR ? "INR" : "USD";

    // Format the price with proper locale
    const formatted = formatPrice(amount, currency);

    return {
      amount,
      currency,
      currencyCode,
      formatted,
    };
  } catch (error) {
    console.error("Error detecting country for price:", error);
    // Default to INR if detection fails
    return {
      amount: priceINR,
      currency: "₹",
      currencyCode: "INR",
      formatted: formatPrice(priceINR, "₹"),
    };
  }
};

/**
 * Get price synchronously (uses cached country info)
 * @param priceINR - Price in Indian Rupees
 * @param priceUSD - Price in US Dollars
 * @returns PriceInfo object with formatted price
 */
export const getPriceByLocationSync = (
  priceINR: number,
  priceUSD: number,
): PriceInfo => {
  try {
    const countryInfo = getCountryInfoSync();
    const isInIndia = countryInfo.country === "India";
    const hasValidUSD = typeof priceUSD === "number" && priceUSD > 0;
    const shouldUseINR = isInIndia || !hasValidUSD;

    const amount = shouldUseINR ? priceINR : priceUSD;
    const currency = shouldUseINR ? "₹" : "$";
    const currencyCode = shouldUseINR ? "INR" : "USD";

    const formatted = formatPrice(amount, currency);

    return {
      amount,
      currency,
      currencyCode,
      formatted,
    };
  } catch (error) {
    console.error("Error getting country for price:", error);
    // Default to INR if detection fails
    return {
      amount: priceINR,
      currency: "₹",
      currencyCode: "INR",
      formatted: formatPrice(priceINR, "₹"),
    };
  }
};

/**
 * Format price with proper locale and currency symbol
 * @param amount - Numeric amount
 * @param currency - Currency symbol ('₹' or '$')
 * @returns Formatted price string
 */
export const formatPrice = (amount: number, currency: "₹" | "$"): string => {
  const numericAmount =
    typeof amount === "number" ? amount : parseFloat(amount) || 0;

  // For USD, use US locale formatting
  if (currency === "$") {
    return `$${numericAmount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  // For INR, use Indian locale formatting
  return `₹${numericAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Extract numeric price from string (for backward compatibility)
 * @param priceString - Price string like "₹4000" or "$50"
 * @returns Numeric price value
 */
export const extractNumericPrice = (priceString: string): number => {
  if (typeof priceString === "number") {
    return priceString;
  }

  // Remove currency symbols and commas
  const numericString = priceString.replace(/[$₹€£,]/g, "").trim();
  return parseFloat(numericString) || 0;
};

/**
 * Get currency symbol based on user location
 * @returns Currency symbol ('₹' or '$')
 */
export const getCurrencySymbol = async (): Promise<"₹" | "$"> => {
  try {
    const countryInfo = await detectUserCountry();
    return countryInfo.country === "India" ? "₹" : "$";
  } catch (error) {
    return "₹"; // Default to INR
  }
};

/**
 * Get currency symbol synchronously
 * @returns Currency symbol ('₹' or '$')
 */
export const getCurrencySymbolSync = (): "₹" | "$" => {
  try {
    const countryInfo = getCountryInfoSync();
    return countryInfo.country === "India" ? "₹" : "$";
  } catch (error) {
    return "₹"; // Default to INR
  }
};

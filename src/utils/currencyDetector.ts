/**
 * Detects user's country based on IP address
 * Returns country code (e.g., 'US', 'IN', etc.)
 */
export const detectUserCountry = async (): Promise<string | null> => {
  try {
    console.log("🌐 Fetching IP location from ipapi.co...");

    // Try multiple APIs for better reliability
    const apis = [
      "https://ipapi.co/json/",
      "https://ipwho.is/",
      "https://ip-api.com/json/",
      //"https://ipapi.co/json/",
      "https://extreme-ip-lookup.com/json/",
    ];

    for (const apiUrl of apis) {
      try {
        console.log(`🔄 Trying API: ${apiUrl}`);
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          console.warn(`❌ API failed: ${apiUrl}`, response.status);
          continue;
        }

        const data = await response.json();
        console.log("📍 IP Location Data:", {
          api: apiUrl,
          country: data.country || data.country_name,
          countryCode: data.country_code || data.countryCode,
          regionName: data.regionName || data.region,
          city: data.city,
          timezone: data.timezone,
        });

        // Return country code from any successful API
        const countryCode = data.country_code || data.countryCode || null;
        if (countryCode) {
          console.log("✅ Successfully detected country:", countryCode);
          return countryCode;
        }
      } catch (apiError) {
        console.warn(`⚠️ API error for ${apiUrl}:`, apiError);
        continue; // Try next API
      }
    }

    console.warn("❌ All APIs failed");
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

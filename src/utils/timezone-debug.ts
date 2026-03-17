/**
 * Timezone Detection Utilities
 * Helps diagnose timezone-related issues
 */

/**
 * Get detailed timezone information for debugging
 */
export const getTimezoneInfo = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();

  // Get current time in user's timezone
  const userTimeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Get UTC time
  const utcFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return {
    timezone,
    userTime: userTimeFormatter.format(now),
    utcTime: utcFormatter.format(now),
    offset: -now.getTimezoneOffset() / 60, // Hours offset from UTC
    isDST:
      now.getTimezoneOffset() <
      new Date(now.getFullYear(), 0, 1).getTimezoneOffset(),
  };
};

/**
 * Check if detected timezone matches expected region
 * @param expectedRegions - Array of expected timezone regions (e.g., ['America', 'New_York'])
 */
export const validateTimezone = (
  expectedRegions: string[] = [],
): {
  isValid: boolean;
  detected: string;
  message: string;
} => {
  const detected = getTimezoneInfo().timezone;

  if (expectedRegions.length === 0) {
    return {
      isValid: true,
      detected,
      message: `Detected timezone: ${detected}`,
    };
  }

  const isValid = expectedRegions.some(
    (region) =>
      detected.includes(region) ||
      detected.toLowerCase().includes(region.toLowerCase()),
  );

  return {
    isValid,
    detected,
    message: isValid
      ? `✓ Timezone ${detected} matches expected regions`
      : `⚠ Timezone ${detected} does not match expected regions: ${expectedRegions.join(", ")}`,
  };
};

/**
 * Log timezone information to console for debugging
 */
export const logTimezoneDebug = () => {
  const info = getTimezoneInfo();
  console.group("🌍 Timezone Information");
  console.log("Detected Timezone:", info.timezone);
  console.log("Local Time:", info.userTime);
  console.log("UTC Time:", info.utcTime);
  console.log(
    "UTC Offset:",
    info.offset > 0 ? `+${info.offset}` : info.offset,
    "hours",
  );
  console.log("Daylight Saving:", info.isDST ? "Active" : "Not Active");
  console.groupEnd();
  return info;
};

/**
 * Common US timezones for validation
 */
export const US_TIMEZONES = [
  "America/New_York", // Eastern
  "America/Chicago", // Central
  "America/Denver", // Mountain
  "America/Los_Angeles", // Pacific
  "America/Anchorage", // Alaska
  "Pacific/Honolulu", // Hawaii
];

/**
 * Common Indian timezones
 */
export const INDIA_TIMEZONES = [
  "Asia/Kolkata", // Modern IANA timezone name for India
];

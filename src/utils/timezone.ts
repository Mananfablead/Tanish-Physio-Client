/**
 * Timezone utilities for handling UTC to local time conversions
 */

/**
 * Get the user's current timezone
 * @returns {string} IANA timezone string (e.g., 'America/New_York')
 */
export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Convert UTC time string to local time string
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} utcTime - Time in HH:MM format (UTC)
 * @param {string} targetTimezone - Target timezone (defaults to user's timezone)
 * @returns {string} Local time in HH:MM format
 */
export const convertUTCToLocalTime = (
  date,
  utcTime,
  targetTimezone = getUserTimezone(),
) => {
  try {
    if (!targetTimezone || targetTimezone === "UTC") {
      return utcTime;
    }

    const [hours, minutes] = utcTime.split(":").map(Number);

    // Create a date object in UTC
    const utcDate = new Date(
      Date.UTC(
        new Date(date).getUTCFullYear(),
        new Date(date).getUTCMonth(),
        new Date(date).getUTCDate(),
        hours,
        minutes,
      ),
    );

    // Convert to target timezone
    const options: Intl.DateTimeFormatOptions = {
      timeZone: targetTimezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const formatter = new Intl.DateTimeFormat("en-US", options);
    return formatter.format(utcDate);
  } catch (error) {
    console.error("Error converting UTC to local time:", error);
    return utcTime; // Fallback to original time
  }
};

/**
 * Convert local time string to UTC time string
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} localTime - Time in HH:MM format (local)
 * @param {string} sourceTimezone - Source timezone (defaults to user's timezone)
 * @returns {string} UTC time in HH:MM format
 */
export const convertLocalToUTCTime = (
  date,
  localTime,
  sourceTimezone = getUserTimezone(),
) => {
  try {
    if (!sourceTimezone || sourceTimezone === "UTC") {
      return localTime;
    }

    const [hours, minutes] = localTime.split(":").map(Number);

    // Create a date object in the source timezone
    const localDate = new Date(
      new Date(date).getFullYear(),
      new Date(date).getMonth(),
      new Date(date).getDate(),
      hours,
      minutes,
    );

    // Get the UTC equivalent
    const utcHours = localDate.getUTCHours();
    const utcMinutes = localDate.getUTCMinutes();

    return `${String(utcHours).padStart(2, "0")}:${String(utcMinutes).padStart(2, "0")}`;
  } catch (error) {
    console.error("Error converting local to UTC time:", error);
    return localTime; // Fallback to original time
  }
};

/**
 * Format time for display (12-hour format with AM/PM)
 * @param {string} time - Time in HH:MM format
 * @returns {string} Formatted time (e.g., "2:30 PM")
 */
export const formatTimeDisplay = (time) => {
  if (!time) return "";

  const [hour, minute] = time.split(":");
  const h = Number(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 || 12;
  return `${formattedHour}:${minute} ${ampm}`;
};

/**
 * Convert availability data from API to use local times
 * @param {Array} availability - Array of availability objects from API
 * @param {string} clientTimezone - Client timezone
 * @returns {Array} Availability with converted times
 */
export const convertAvailabilityToLocalTime = (
  availability,
  clientTimezone = getUserTimezone(),
) => {
  if (!Array.isArray(availability)) {
    return [];
  }

  return availability.map((avail) => ({
    ...avail,
    timeSlots: avail.timeSlots.map((slot) => ({
      ...slot,
      start: convertUTCToLocalTime(avail.date, slot.start, clientTimezone),
      end: convertUTCToLocalTime(avail.date, slot.end, clientTimezone),
    })),
  }));
};

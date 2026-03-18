import { useEffect, useState } from "react";
import { Globe, Clock, MapPin, Loader2 } from "lucide-react";
import { getUserTimezone } from "@/utils/timezone";
import {
  getCachedIPLocation,
  getFriendlyLocation,
} from "@/services/ipLocationService";

/**
 * Timezone Tester Component
 * Use this to test different country timezones quickly
 *
 * Usage: Add ?tz=America/New_York to URL or use the dropdown
 */

const TIMEZONE_OPTIONS = [
  { value: "auto", label: "🌍 Auto-detect (Current)", flag: "🌍" },
  { value: "America/New_York", label: "🇺🇸 US - Eastern Time", flag: "🇺🇸" },
  { value: "America/Los_Angeles", label: "🇺🇸 US - Pacific Time", flag: "🇺🇸" },
  { value: "America/Chicago", label: "🇺🇸 US - Central Time", flag: "🇺🇸" },
  { value: "Europe/London", label: "🇬🇧 UK - London", flag: "🇬🇧" },
  { value: "Europe/Paris", label: "🇫🇷 France - Paris", flag: "🇫🇷" },
  { value: "Europe/Berlin", label: "🇩🇪 Germany - Berlin", flag: "🇩🇪" },
  { value: "Asia/Kolkata", label: "🇮🇳 India - Kolkata", flag: "🇮🇳" },
  { value: "Asia/Dubai", label: "🇦🇪 UAE - Dubai", flag: "🇦🇪" },
  { value: "Asia/Singapore", label: "🇸🇬 Singapore", flag: "🇸🇬" },
  { value: "Asia/Tokyo", label: "🇯🇵 Japan - Tokyo", flag: "🇯🇵" },
  { value: "Australia/Sydney", label: "🇦🇺 Australia - Sydney", flag: "🇦🇺" },
];

// Check if running in development mode
const isDevelopment = import.meta.env.DEV;

export function TimezoneTester() {
  const [selectedTimezone, setSelectedTimezone] = useState<string>("auto");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [ipLocation, setIPLocation] = useState<any>(null);
  const [loadingIP, setLoadingIP] = useState(false);

  // Get actual browser timezone
  const browserTimezone = getUserTimezone();

  // Fetch IP-based location on mount
  useEffect(() => {
    const fetchIPLocation = async () => {
      setLoadingIP(true);
      try {
        const locationData = await getCachedIPLocation();
        if (locationData) {
          setIPLocation(locationData);
          console.log(
            "[TimezoneTester] IP Location detected:",
            getFriendlyLocation(locationData),
          );
        }
      } catch (error) {
        console.error("[TimezoneTester] Failed to fetch IP location:", error);
      } finally {
        setLoadingIP(false);
      }
    };

    if (isPanelOpen) {
      fetchIPLocation();
    }
  }, [isPanelOpen]);

  // Use selected timezone or browser timezone
  const activeTimezone =
    selectedTimezone === "auto" ? browserTimezone : selectedTimezone;

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time for display
  const formatTime = (date: Date, timezone: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(date);
    } catch (error) {
      return "Invalid timezone";
    }
  };

  // Format date for display
  const formatDate = (date: Date, timezone: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (error) {
      return "";
    }
  };

  // Get timezone offset
  const getTimezoneOffset = (timezone: string) => {
    try {
      const now = new Date();
      const tzDate = new Date(
        now.toLocaleString("en-US", { timeZone: timezone }),
      );
      const utcDate = new Date(
        now.toLocaleString("en-US", { timeZone: "UTC" }),
      );
      const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
      const sign = offset >= 0 ? "+" : "";
      return `UTC${sign}${offset}`;
    } catch {
      return "";
    }
  };

  // Handle timezone change
  const handleTimezoneChange = (tz: string) => {
    setSelectedTimezone(tz);
    if (tz !== "auto") {
      // Store in localStorage for persistence during testing
      localStorage.setItem("test-timezone", tz);

      // Update URL parameter
      const url = new URL(window.location.href);
      url.searchParams.set("tz", tz);
      window.history.pushState({}, "", url.toString());

      console.log(`[Timezone Tester] Changed to: ${tz}`);
      console.log(`[Timezone Tester] API requests will now use: ${tz}`);
      alert(
        `Timezone changed to: ${tz}\n\nAll API requests will use this timezone for conversion.\nRefresh the page to see the effect.`,
      );
    } else {
      localStorage.removeItem("test-timezone");

      // Remove URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("tz");
      window.history.pushState({}, "", url.toString());

      console.log("[Timezone Tester] Back to auto-detect");
      console.log("[Timezone Tester] Using browser's actual timezone");
    }
  };

  // Check if there's a timezone in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTz = params.get("tz");

    if (urlTz && TIMEZONE_OPTIONS.some((opt) => opt.value === urlTz)) {
      setSelectedTimezone(urlTz);
      console.log(`[Timezone Tester] Loaded from URL: ${urlTz}`);
    }

    // Also check localStorage
    const stored = localStorage.getItem("test-timezone");
    if (stored && TIMEZONE_OPTIONS.some((opt) => opt.value === stored)) {
      setSelectedTimezone(stored);
    }
  }, []);

  // Hide completely in production
  if (!isDevelopment) {
    return null;
  }

  if (!isPanelOpen) {
    return null;
  }

  // if (!isPanelOpen) {
  //   return (
  //     <button
  //       onClick={() => setIsPanelOpen(true)}
  //       className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
  //     >
  //       <Globe className="h-5 w-5" />
  //       Test Timezone
  //     </button>
  //   );
  // }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Timezone Tester</h3>
        </div>
        <button
          onClick={() => setIsPanelOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Current Time Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-900">
            Current Time:
          </span>
        </div>
        <div className="text-2xl font-bold text-blue-900">
          {formatTime(currentTime, activeTimezone)}
        </div>
        <div className="text-xs text-blue-700 mt-1">
          {formatDate(currentTime, activeTimezone)}
        </div>
        <div className="text-[10px] text-blue-600 mt-1">
          {getTimezoneOffset(activeTimezone)} • {activeTimezone}
        </div>
      </div>

      {/* Browser Timezone Info */}
      <div className="bg-gray-50 rounded-lg p-2 mb-3 text-xs">
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="h-3 w-3 text-gray-500" />
          <span className="text-gray-600">Browser detects:</span>
        </div>
        <div className="font-semibold text-gray-900">{browserTimezone}</div>
        {selectedTimezone !== "auto" && (
          <div className="text-green-600 text-[10px] mt-1">
            ⚠️ Overridden for testing
          </div>
        )}
      </div>

      {/* IP-Based Location Detection */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-purple-600" />
          <span className="text-xs font-semibold text-purple-900">
            IP-Based Detection
          </span>
          {loadingIP && (
            <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
          )}
        </div>

        {ipLocation ? (
          <div className="space-y-1 text-xs text-purple-800">
            <div className="font-medium text-purple-900">
              📍 {getFriendlyLocation(ipLocation)}
            </div>
            <div className="flex justify-between">
              <span>Timezone:</span>
              <span className="font-mono">{ipLocation.timezone}</span>
            </div>
            <div className="flex justify-between">
              <span>UTC Offset:</span>
              <span className="font-mono">{ipLocation.utc_offset}</span>
            </div>
            <div className="flex justify-between">
              <span>IP Address:</span>
              <span className="font-mono text-[10px]">{ipLocation.ip}</span>
            </div>
          </div>
        ) : loadingIP ? (
          <div className="text-xs text-purple-700 italic">
            Detecting location from IP...
          </div>
        ) : (
          <div className="text-xs text-purple-700 italic">
            Unable to detect location from IP
          </div>
        )}
      </div>

      {/* Timezone Selector */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Select Country/Timezone:
        </label>
        <select
          value={selectedTimezone}
          onChange={(e) => handleTimezoneChange(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {TIMEZONE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-[10px] text-amber-800">
        <strong>💡 Tip:</strong> You can also use URL parameter:{" "}
        <code className="bg-amber-100 px-1 rounded">?tz=America/New_York</code>
      </div>

      {/* Reset Button */}
      {selectedTimezone !== "auto" && (
        <button
          onClick={() => handleTimezoneChange("auto")}
          className="w-full mt-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-md transition-colors"
        >
          ↺ Reset to Auto-detect
        </button>
      )}
    </div>
  );
}

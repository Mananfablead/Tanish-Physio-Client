import { Clock, Globe } from "lucide-react";

interface TimezoneNoticeProps {
  adminTimezone?: string;
  clientTimezone?: string;
}

export function TimezoneNotice({
  adminTimezone = "Asia/Kolkata",
  clientTimezone,
}: TimezoneNoticeProps) {
  // Format timezone for display (e.g., "America/New_York" → "EST (New York)")
  const formatTimezone = (tz: string) => {
    try {
      const parts = tz.split("/");
      const city = parts[1]?.replace("_", " ") || parts[0];
      return city;
    } catch {
      return tz;
    }
  };

  // Get timezone abbreviation (e.g., "America/New_York" → "EST")
  const getTimezoneAbbr = (tz: string) => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "short",
      });
      const parts = formatter.formatToParts(now);
      const tzPart = parts.find((p) => p.type === "timeZoneName");
      return tzPart?.value || "";
    } catch {
      return "";
    }
  };

  const clientAbbr = clientTimezone ? getTimezoneAbbr(clientTimezone) : "";
  const adminAbbr = adminTimezone ? getTimezoneAbbr(adminTimezone) : "";

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Globe className="h-6 w-6 text-blue-600 mt-0.5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 text-sm mb-2">
            🕐 Timezone Information
          </h4>

          <div className="space-y-2 text-xs text-blue-800">
            {/* Client's Local Time */}
            {clientTimezone && (
              <div className="flex items-center gap-2 bg-white/70 rounded-md px-3 py-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="font-medium">Your Time:</span>
                <span className="text-blue-700">
                  {formatTimezone(clientTimezone)} ({clientAbbr})
                </span>
              </div>
            )}

            {/* Admin's Time */}
            <div className="flex items-center gap-2 bg-white/70 rounded-md px-3 py-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="font-medium">Therapist's Time:</span>
              <span className="text-blue-700">
                {formatTimezone(adminTimezone)} ({adminAbbr})
              </span>
            </div>

            {/* Conversion Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-2">
              <p className="font-medium text-amber-900 mb-1">
                ⚠️ Important Note:
              </p>
              <p className="text-amber-800 leading-relaxed">
                Times shown above are automatically converted to{" "}
                <strong>your local timezone</strong>. When you book a slot, it
                will be in your therapist's timezone ({adminAbbr}).
              </p>
              <p className="text-amber-700 mt-1 text-[11px]">
                Example: If you see 10:30 PM EST and therapist is in IST, the
                actual session time is 9:00 AM IST (next day).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

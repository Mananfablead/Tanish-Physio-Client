import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface RescheduleModalProps {
  isOpen: boolean;
  sessionToReschedule: any;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
  availability: any[];
  currentMonth: number;
  currentYear: number;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  rescheduleError: string | null;
  rescheduleDate: string;
  rescheduleTime: string;
  setRescheduleDate: (date: string) => void;
  setRescheduleTime: (time: string) => void;
  setSelectedDate: (date: string | null) => void;
}

export function RescheduleModal({
  isOpen,
  sessionToReschedule,
  onClose,
  onConfirm,
  availability,
  currentMonth,
  currentYear,
  setCurrentMonth,
  setCurrentYear,
  rescheduleError,
  rescheduleDate,
  rescheduleTime,
  setRescheduleDate,
  setRescheduleTime,
  setSelectedDate
}: RescheduleModalProps) {
  const [calendarWeeks, setCalendarWeeks] = useState<any[][]>([]);

  // Calendar utility functions
  const isPastDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const h = Number(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const handleTimeSlotClick = (date: string, timeSlot: any) => {
    if (timeSlot.status === 'available') {
      setSelectedDate(date);
      setRescheduleDate(date);
      setRescheduleTime(timeSlot.start);
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return ''; 
      case 1: return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 2: return 'bg-muted text-muted-foreground'; 
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Calendar weeks memoization
  useEffect(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const availabilityForDate = availability.find((item: any) => item.date === dateStr);

      let status = 0;
      if (availabilityForDate && availabilityForDate.timeSlots) {
        const slots = availabilityForDate.timeSlots;
        const bookedSlots = slots.filter((slot: any) => slot.status === 'booked');
        const unavailableSlots = slots.filter((slot: any) => slot.status === 'unavailable');
        const availableSlots = slots.filter((slot: any) => slot.status === 'available');

        if (bookedSlots.length > 0) {
          status = 1;
        } else if (unavailableSlots.length > 0 && availableSlots.length === 0) {
          status = 2;
        } else if (availableSlots.length > 0) {
          status = 0;
        }
      }

      return {
        date: dateStr,
        day,
        status,
        availability: availabilityForDate
      };
    });

    const weeks = [];
    const paddingStart = firstDayOfMonth;
    const paddingEnd = (7 - (paddingStart + daysInMonth) % 7) % 7;

    const paddedDays = [
      ...Array(paddingStart).fill(null),
      ...calendarDays,
      ...Array(paddingEnd).fill(null)
    ];

    for (let i = 0; i < paddedDays.length; i += 7) {
      weeks.push(paddedDays.slice(i, i + 7));
    }

    setCalendarWeeks(weeks);
  }, [currentYear, currentMonth, availability]);

  if (!isOpen || !sessionToReschedule) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="
        bg-white w-full max-w-4xl rounded-2xl shadow-xl
        max-h-[95vh] flex flex-col
      "
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 border-b">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Reschedule Session
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Select a new date and time for this session.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ================= BODY (SCROLLABLE) ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* CURRENT SESSION INFO */}
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <p className="text-sm">
                <span className="text-slate-500">Current Date:</span>{" "}
                <span className="font-medium">
                  {sessionToReschedule.date
                    ? new Date(sessionToReschedule.date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </span>
              </p>

              <p className="text-sm">
                <span className="text-slate-500">Current Time:</span>{" "}
                <span className="font-medium">
                  {sessionToReschedule.startTime
                    ? new Date(
                        sessionToReschedule.startTime
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : sessionToReschedule.time || "N/A"}
                </span>
              </p>
            </div>
          </div>

          {/* CALENDAR + SLOTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CALENDAR */}
            <div className="border rounded-lg p-3 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-800 text-sm">
                  Select Date
                </h4>

                <div className="flex items-center gap-1">
                  <button
                    className="h-8 w-8 rounded-md border bg-white hover:bg-slate-100 flex items-center justify-center"
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear(currentYear - 1);
                      } else {
                        setCurrentMonth(currentMonth - 1);
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-xs font-semibold px-2">
                    {new Date(currentYear, currentMonth).toLocaleString(
                      "default",
                      { month: "short", year: "numeric" }
                    )}
                  </span>

                  <button
                    className="h-8 w-8 rounded-md border bg-white hover:bg-slate-100 flex items-center justify-center"
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear(currentYear + 1);
                      } else {
                        setCurrentMonth(currentMonth + 1);
                      }
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
                {"Su Mo Tu We Th Fr Sa".split(" ").map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarWeeks.flat().map((day, i) =>
                  day ? (
                    <button
                      key={i}
                      disabled={isPastDate(day.date)}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setRescheduleDate(day.date);
                      }}
                      className={`
                      h-8 w-8 rounded-full text-xs flex items-center justify-center
                      ${isPastDate(day.date)
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : getStatusColor(day.status)}
                      ${rescheduleDate === day.date
                        ? "ring-2 ring-primary bg-primary text-white"
                        : ""}
                    `}
                    >
                      {day.day}
                    </button>
                  ) : (
                    <div key={i} />
                  )
                )}
              </div>
            </div>

            {/* TIME SLOTS */}
            <div className="border rounded-lg p-3 bg-slate-50">
              <h4 className="font-bold text-slate-800 mb-3 text-sm">
                Available Time Slots
              </h4>

             {rescheduleDate ? (
  <div className="space-y-2 max-h-48 md:max-h-80 overflow-y-auto">
    {(() => {
      const selectedDay = availability.find(
        (a: any) => a.date === rescheduleDate
      );

      const availableSlots = selectedDay?.timeSlots?.filter(
        (slot: any) => slot.status === "available"
      );

      // 👉 No slots case
      if (!selectedDay || selectedDay.timeSlots.length === 0) {
        return (
          <p className="text-sm text-gray-500 text-center py-4">
            No slots available
          </p>
        );
      }

      if (availableSlots.length === 0) {
        return (
          <p className="text-sm text-red-500 text-center py-4">
            All slots are booked
          </p>
        );
      }

      // 👉 Show slots
      return selectedDay.timeSlots.map((slot: any, i: number) => (
        <button
          key={i}
          disabled={slot.status !== "available"}
          onClick={() =>
            slot.status === "available" &&
            handleTimeSlotClick(rescheduleDate, slot)
          }
          className={`
            w-full p-2 rounded-lg border text-left text-sm
            ${
              slot.status === "available"
                ? "border-green-300 hover:bg-green-50"
                : slot.status === "booked"
                ? "border-red-300 opacity-50"
                : "border-gray-300 opacity-50"
            }
            ${
              rescheduleTime === slot.start
                ? "ring-2 ring-primary bg-primary/10"
                : ""
            }
          `}
        >
          {formatTime(slot.start)} – {formatTime(slot.end)}
        </button>
      ));
    })()}
  </div>
) : (
  <p className="text-xs text-slate-500">
    Select a date to see time slots
  </p>
)}
            </div>
          </div>

          {/* ERROR */}
          {rescheduleError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">
                {rescheduleError}
              </p>
            </div>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-4 sm:px-6 py-4 border-t bg-slate-50 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            className="flex-1 bg-gradient-to-r from-primary to-accent"
            disabled={!rescheduleDate || !rescheduleTime}
            onClick={() => onConfirm(rescheduleDate, rescheduleTime)}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
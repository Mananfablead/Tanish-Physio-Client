import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string, timeSlot?: {start: string, end: string}) => void;
  availability: any[];
  currentMonth: number;
  currentYear: number;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  scheduleError: string | null;
  scheduleDate: string;
  scheduleTime: string;
  setScheduleDate: (date: string) => void;
  setScheduleTime: (time: string) => void;
  setSelectedDate: (date: string | null) => void;
  therapistName: string;
}

export function ScheduleModal({
  isOpen,
  onClose,
  onConfirm,
  availability,
  currentMonth,
  currentYear,
  setCurrentMonth,
  setCurrentYear,
  scheduleError,
  scheduleDate,
  scheduleTime,
  setScheduleDate,
  setScheduleTime,
  setSelectedDate,
  therapistName
}: ScheduleModalProps) {
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
      setScheduleDate(date);
      setScheduleTime(timeSlot.start);
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

  if (!isOpen) return null;

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
              Schedule Session
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Select a date and time for your session with {therapistName}.
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
          {/* INFO CARD */}
       

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
                        setScheduleDate(day.date);
                      }}
                      className={`
                      h-8 w-8 rounded-full text-xs flex items-center justify-center
                      ${isPastDate(day.date)
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : getStatusColor(day.status)}
                      ${scheduleDate === day.date
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

              {scheduleDate ? (
                <div className="space-y-2 max-h-48 md:max-h-80 overflow-y-auto">
                  {availability
                    .find((a: any) => a.date === scheduleDate)
                    ?.timeSlots?.map((slot: any, i: number) => (
                      <button
                        key={i}
                        disabled={slot.status !== "available"}
                        onClick={() =>
                          slot.status === "available" &&
                          handleTimeSlotClick(scheduleDate, slot)
                        }
                        className={`
                        w-full p-2 rounded-lg border text-left text-sm
                        ${slot.status === "available"
                          ? "border-green-300 hover:bg-green-50"
                          : slot.status === "booked"
                          ? "border-red-300 opacity-50"
                          : "border-gray-300 opacity-50"}
                        ${scheduleTime === slot.start
                          ? "ring-2 ring-primary bg-primary/10"
                          : ""}
                      `}
                      >
                        {formatTime(slot.start)} – {formatTime(slot.end)}
                      </button>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Select a date to see time slots
                </p>
              )}
            </div>
          </div>

          {/* SELECTED DATE/TIME PREVIEW */}
          {(scheduleDate || scheduleTime) && (
            <div className="p-3 rounded-lg border bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Selected Session:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {scheduleDate && (
                  <p>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    <span className="font-medium">
                      {new Date(scheduleDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </p>
                )}
                {scheduleTime && (
                  <p>
                    <span className="text-muted-foreground">Time:</span>{" "}
                    <span className="font-medium">
                      {formatTime(scheduleTime)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ERROR */}
          {scheduleError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">
                {scheduleError}
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
            disabled={!scheduleDate || !scheduleTime}
            onClick={() => {
              // Find the selected time slot to pass complete information
              const selectedSlot = availability
                .find((a: any) => a.date === scheduleDate)
                ?.timeSlots?.find((slot: any) => slot.start === scheduleTime);
              
              onConfirm(scheduleDate, scheduleTime, selectedSlot || undefined);
            }}
          >
            Confirm Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}
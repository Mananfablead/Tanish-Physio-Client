import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getUserTimezone, formatTimeDisplay } from "@/utils/timezone.js";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    date: string,
    time: string,
    timeSlot?: { start: string; end: string },
  ) => void;
  availability: any[];
  currentMonth: number;
  currentYear: number;
  selectedDate: string | null;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  scheduleError: string | null;
  scheduleDate: string;
  scheduleTime: string;
  setScheduleDate: (date: string) => void;
  setScheduleTime: (time: string) => void;
  setSelectedDate: (date: string | null) => void;
  therapistName: string;
  selectedTimeSlot: { start: string; end: string } | null;
  setSelectedTimeSlot: (slot: { start: string; end: string } | null) => void;
  bookingType?: "regular" | "free-consultation";
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
  therapistName,
  selectedTimeSlot,
  setSelectedTimeSlot,
  bookingType = "regular",
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
    // Time is already in local timezone from backend
    return formatTimeDisplay(time);
  };

  const handleTimeSlotClick = (date: string, timeSlot: any) => {
    // Only allow selecting time slots that match the booking type
    const isValidSlot =
      timeSlot.status === "available" &&
      ((bookingType === "free-consultation" && timeSlot.duration === 15) ||
        (bookingType !== "free-consultation" && timeSlot.duration === 45));

    if (isValidSlot) {
      setSelectedDate(date);
      setScheduleDate(date);
      // Use originalStart/originalEnd if available (admin's actual time), otherwise use start/end
      const slotStart = timeSlot.originalStart || timeSlot.start;
      const slotEnd = timeSlot.originalEnd || timeSlot.end;
      setScheduleTime(slotStart);
      setSelectedTimeSlot({ start: slotStart, end: slotEnd });
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-gray-100 text-gray-400 cursor-not-allowed"; // Not Booked
      case 1:
        return "bg-blue-100 text-blue-700 font-semibold"; // Booked
      case 2:
        return "bg-red-100 text-red-700"; // Unavailable
      default:
        return "bg-gray-100 text-gray-400 cursor-not-allowed";
    }
  };

  // Get availability for a specific date
  const getAvailabilityForDate = (date: string) => {
    return availability.find((avail) => avail.date === date);
  };

  // Check if date has available slots
  const hasAvailableSlots = (dateStr: string) => {
    const dayAvailability = availability.find(
      (item: any) => item.date === dateStr,
    );
    if (!dayAvailability || !Array.isArray(dayAvailability.timeSlots)) {
      return false;
    }
    return dayAvailability.timeSlots.some(
      (slot: any) => slot.status === "available",
    );
  };

  // Calendar weeks memoization
  useEffect(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const availabilityForDate = availability.find(
        (item: any) => item.date === dateStr,
      );

      let status = 0; // Default: Not Booked
      if (availabilityForDate && availabilityForDate.timeSlots) {
        const slots = availabilityForDate.timeSlots;
        const bookedSlots = slots.filter(
          (slot: any) => slot.status === "booked",
        );
        const unavailableSlots = slots.filter(
          (slot: any) => slot.status === "unavailable",
        );
        const availableSlots = slots.filter(
          (slot: any) => slot.status === "available",
        );

        if (availableSlots.length > 0) {
          status = 0; // Available (has available slots)
        } else if (bookedSlots.length > 0) {
          status = 1; // Booked
        } else if (unavailableSlots.length > 0 && availableSlots.length === 0) {
          status = 2; // Unavailable
        }
      }

      return {
        date: dateStr,
        day,
        status,
        availability: availabilityForDate,
      };
    });

    const weeks = [];
    const paddingStart = firstDayOfMonth;
    const paddingEnd = (7 - ((paddingStart + daysInMonth) % 7)) % 7;

    const paddedDays = [
      ...Array(paddingStart).fill(null),
      ...calendarDays,
      ...Array(paddingEnd).fill(null),
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
                      { month: "short", year: "numeric" },
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

              {/* Legend for calendar colors */}
              <div className="flex flex-wrap gap-2 mb-3 justify-center">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></div>
                  <span className="text-xs text-slate-600">Booked</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div>
                  <span className="text-xs text-slate-600">Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div>
                  <span className="text-xs text-slate-600">Unavailable</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300"></div>
                  <span className="text-xs text-slate-600">Not Booked</span>
                </div>
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
                      h-8 w-8 rounded-full text-xs flex items-center justify-center transition-all
                      ${
                        isPastDate(day.date)
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : scheduleDate === day.date
                            ? "ring-2 ring-primary bg-primary text-white"
                            : hasAvailableSlots(day.date)
                              ? "bg-green-100 text-green-700 hover:bg-green-200" // Available
                              : getAvailabilityForDate(day.date)
                                ? getStatusColor(day.status) // Booked/Unavailable
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      } // Not Booked
                    `}
                    >
                      {day.day}
                    </button>
                  ) : (
                    <div key={i} />
                  ),
                )}
              </div>
            </div>

            {/* TIME SLOTS */}
            <div className="border rounded-lg p-3 bg-slate-50">
              <div>
                <h4 className="font-bold text-slate-800 mb-3 text-sm">
                  Available Time Slots
                </h4>

                {/* Status Legend */}
                <div className="flex flex-wrap gap-3 text-xs mb-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-slate-600">Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    <span className="text-slate-600">Unavailable</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-slate-600">Booked</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                    <span className="text-slate-600">Past</span>
                  </div>
                </div>
              </div>

              {scheduleDate ? (
                (() => {
                  // Filter time slots based on booking type
                  const dayAvailability = availability.find(
                    (a: any) => a.date === scheduleDate,
                  );
                  if (!dayAvailability || !dayAvailability.timeSlots) {
                    // Show appropriate message when no time slots are defined for the selected date
                    return (
                      <div className="text-center py-8">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                          <Clock className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-red-500 mb-1">
                          No Time Slots Available
                        </h3>
                        <p className="text-red-400 text-sm">
                          No time slots have been defined for{" "}
                          {new Date(scheduleDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    );
                  }

                  // Helper function to check if a time slot is in the past
                  const isTimeSlotPast = (date: any, time: any): boolean => {
                    if (!date || !time) return false;

                    const [hours, minutes] = time.split(":").map(Number);
                    const slotDateTime = new Date(date);
                    slotDateTime.setHours(hours, minutes, 0, 0);

                    const now = new Date();
                    return slotDateTime < now;
                  };

                  // Filter slots based on booking type
                  const filteredSlots = dayAvailability.timeSlots.filter(
                    (slot: any) => {
                      // Only show available slots
                      if (slot.status !== "available") return false;

                      // Filter by duration based on booking type
                      if (bookingType === "free-consultation") {
                        // Free consultation slots should have 15 minute duration
                        return slot.duration === 15;
                      } else {
                        // Regular slots should have 45 minute duration
                        return slot.duration === 45;
                      }
                    },
                  );

                  return filteredSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-48 md:max-h-80 overflow-y-auto">
                      {filteredSlots.map((slot: any, i: number) => {
                        const isSelected =
                          selectedTimeSlot?.start === slot.start &&
                          selectedTimeSlot?.end === slot.end;

                        return (
                          <button
                            key={i}
                            disabled={
                              slot.status !== "available" ||
                              isTimeSlotPast(scheduleDate, slot.start)
                            }
                            onClick={() => {
                              const isPast = isTimeSlotPast(
                                scheduleDate,
                                slot.start,
                              );
                              if (slot.status === "available" && !isPast) {
                                handleTimeSlotClick(scheduleDate, slot);
                              }
                            }}
                            className={`
                              w-full p-2 rounded-lg border text-left text-sm font-medium transition-all
                              ${
                                isSelected
                                  ? "bg-green-600 text-white border-green-600"
                                  : isTimeSlotPast(scheduleDate, slot.start)
                                    ? "border border-gray-400 text-gray-400 cursor-not-allowed bg-gray-50"
                                    : slot.status === "available"
                                      ? "border border-green-500 text-green-600 bg-green-50 hover:bg-green-100"
                                      : slot.status === "booked"
                                        ? "border border-red-500 text-red-500 cursor-not-allowed"
                                        : "border border-gray-400 text-gray-400 cursor-not-allowed bg-gray-50"
                              }
                            `}
                          >
                            {formatTime(slot.start)} – {formatTime(slot.end)}
                            <div className="text-xs opacity-70">
                              ({slot.duration}min{" "}
                              {slot.bookingType === "free-consultation"
                                ? "Free"
                                : "Regular"}
                              )
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                        <Clock className="h-6 w-6 text-red-500" />
                      </div>
                      <h3 className="text-lg font-bold text-red-500 mb-1">
                        Slots Not Available
                      </h3>
                      <p className="text-red-400 text-sm">
                        No available time slots for{" "}
                        {bookingType === "free-consultation"
                          ? "free consultation"
                          : "regular session"}{" "}
                        on{" "}
                        {new Date(scheduleDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  );
                })()
              ) : (
                <p className="text-xs text-slate-500">
                  Select a date to see time slots
                </p>
              )}
            </div>
          </div>

          {/* SELECTED DATE/TIME PREVIEW */}
          {(scheduleDate || selectedTimeSlot) && (
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
                {selectedTimeSlot && (
                  <p>
                    <span className="text-muted-foreground">Time:</span>{" "}
                    <span className="font-medium">
                      {formatTime(selectedTimeSlot.start)} -{" "}
                      {formatTime(selectedTimeSlot.end)}
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
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>

          <Button
            className="flex-1 bg-gradient-to-r from-primary to-accent"
            disabled={!scheduleDate || !selectedTimeSlot}
            onClick={() => {
              onConfirm(
                scheduleDate,
                selectedTimeSlot?.start || "",
                selectedTimeSlot || undefined,
              );
            }}
          >
            Confirm Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}
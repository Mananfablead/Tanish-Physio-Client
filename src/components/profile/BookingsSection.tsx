import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Booking } from "@/types/user";

interface BookingsSectionProps {
  bookingList: Booking[];
}

const ITEMS_PER_PAGE = 5; // Adjust this number as needed

export function BookingsSection({ bookingList }: BookingsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const openBookingDetail = (booking: Booking) => {
    setDetailBooking(booking);
    setIsDetailModalOpen(true);
  };

  const totalPages = Math.ceil(bookingList?.length / ITEMS_PER_PAGE || 0);

  const paginatedBookings = useMemo(() => {
    if (!bookingList || bookingList.length === 0) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return bookingList.slice(startIndex, endIndex);
  }, [bookingList, currentPage]);

  const getServiceExpirationStatus = (booking: Booking) => {
    if (booking.isExpired) {
      return {
        status: "expired",
        text: "Expired",
        color: "text-red-600 bg-red-100",
      };
    }
    if (booking.expiryDate) {
      const expiryDate = new Date(booking.expiryDate);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      if (daysUntilExpiry <= 7) {
        return {
          status: "expiring-soon",
          text: `Expires in ${daysUntilExpiry} days`,
          color: "text-yellow-600 bg-yellow-100",
        };
      }
      return {
        status: "active",
        text: `Expires ${expiryDate.toLocaleDateString()}`,
        color: "text-green-600 bg-green-100",
      };
    }
    // If no expiry date, show created date as reference
    if (booking.createdAt) {
      const createdDate = new Date(booking.createdAt);
      return {
        status: "no-expiry",
        text: `Created ${createdDate.toLocaleDateString()}`,
        color: "text-blue-600 bg-blue-100",
      };
    }
    return {
      status: "unknown",
      text: "No expiry date",
      color: "text-gray-600 bg-gray-100",
    };
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const handleCreateSession = () => {
    const confirmedBooking = bookingList.find(
      (b) => b.status === "confirmed" && !b.sessionCreated,
    );

    if (!confirmedBooking) {
      toast({
        title: "No confirmed booking available to create a session",
        variant: "default",
      });
      return;
    }

    navigate("/schedule", {
      state: {
        bookingId: confirmedBooking._id,
        serviceId: confirmedBooking.serviceId,
        therapistId: confirmedBooking.therapistId,
        date: confirmedBooking.date,
        time: confirmedBooking.time,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Your Bookings
          </h2>
        </div>

        {/* CREATE SESSION BUTTON */}
        {bookingList.filter((b) => b.status === "confirmed").length > 0 && (
          <Badge className="bg-green-100 text-green-700 font-black flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {bookingList.filter((b) => b.status === "confirmed").length}{" "}
            Confirmed
          </Badge>
        )}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block">
        {bookingList.length > 0 ? (
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Service
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Date & Time
                    </th>
                    {/* <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Therapist
                    </th> */}
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* SERVICE */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {booking.serviceName || "N/A"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {booking.serviceId?.name || "N/A"}
                        </div>
                      </td>

                      {/* DATE & TIME */}
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {new Date(booking.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        <br />
                        <span className="text-xs">{booking.timeSlot.start} - {booking.timeSlot.end}</span>
                      </td>

                      {/* THERAPIST */}
                      {/* <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {booking.therapistName || "N/A"}
                      </td> */}

                      {/* AMOUNT */}
                      <td className="px-6 py-4 text-right">
                        <div className="text-right">
                          <span className="font-black text-slate-900">
                            ₹
                            {booking.finalAmount?.toLocaleString() ??
                              booking.amount?.toLocaleString() ??
                              0}
                          </span>
                          {booking.discountAmount > 0 && (
                            <div className="text-slate-500 text-sm line-through">
                              ₹{booking.amount?.toLocaleString()}
                            </div>
                          )}
                          {booking.couponCode && (
                            <div className="text-success text-xs font-medium mt-1">
                              Coupon: {booking.couponCode}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4 text-center">
                        <div className="space-y-2 flex flex-col items-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase
                ${
                  booking.status === "confirmed"
                    ? booking.bookingType === "free-consultation"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                    : booking.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : booking.status === "scheduled"
                          ? "bg-purple-100 text-purple-700"
                          : booking.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                }`}
                          >
                            {booking.bookingType === "free-consultation" &&
                            booking.status === "confirmed"
                              ? "Accepted"
                              : booking.bookingType ===
                                    "subscription-covered" &&
                                  booking.status === "pending"
                                ? "Pending Review"
                                : booking.status || "Unknown"}
                          </span>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-bold text-slate-500 hover:text-primary hover:bg-primary/10 mt-1 h-7 px-2 text-xs"
                            onClick={() => openBookingDetail(booking)}
                          >
                            <Info className="h-3 w-3 mr-1" />
                            Read More
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                <div className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, bookingList.length)}{" "}
                  of {bookingList.length} bookings
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      ),
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Booking History
                </h3>
              </div>
              <div className="py-12 text-center space-y-4">
                <h3 className="text-xl font-black text-slate-900">
                  No Bookings Found
                </h3>
                <p className="text-slate-500 font-medium">
                  You haven't made any bookings yet.
                </p>
                <Link to="/services">
                  <Button className="h-11 rounded-xl px-8 font-black">
                    Explore Services
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden">
        {bookingList.length > 0 ? (
          <div className="space-y-4">
            {paginatedBookings.map((booking) => (
              <Card
                key={booking._id}
                className="p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {booking.serviceName || "N/A"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {booking.serviceId?.name || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">
                        ₹{booking.amount || 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Date</p>
                      <p className="text-sm text-slate-900">
                        {new Date(booking.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Time</p>
                      <p className="text-sm text-slate-900">{booking.time}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="space-y-2 flex flex-col items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-black uppercase
                        ${
                          booking.status === "confirmed"
                            ? booking.bookingType === "free-consultation"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                            : booking.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : booking.status === "scheduled"
                                  ? "bg-purple-100 text-purple-700"
                                  : booking.status === "completed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {booking.bookingType === "free-consultation" &&
                        booking.status === "confirmed"
                          ? "Accepted"
                          : booking.bookingType === "subscription-covered" &&
                              booking.status === "pending"
                            ? "Pending Review"
                            : booking.status || "Unknown"}
                      </span>

                      {/* Expiration badge always show */}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          getServiceExpirationStatus(booking).color
                        }`}
                      >
                        {getServiceExpirationStatus(booking).text}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-bold text-slate-500 hover:text-primary hover:bg-primary/10 w-full h-8 text-xs"
                        onClick={() => openBookingDetail(booking)}
                      >
                        <Info className="h-3 w-3 mr-1" />
                        Read More
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Mobile Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center space-y-4 pt-4">
                <div className="text-sm text-slate-500 text-center">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, bookingList.length)}{" "}
                  of {bookingList.length} bookings
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8"
                        >
                          {pageNum}
                        </Button>
                      ),
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center"
                  >
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Booking History
                </h3>
              </div>
              <div className="py-12 text-center space-y-4">
                <h3 className="text-xl font-black text-slate-900">
                  No Bookings Found
                </h3>
                <p className="text-slate-500 font-medium">
                  You haven't made any bookings yet.
                </p>
                <Link to="/services">
                  <Button className="h-11 rounded-xl px-8 font-black">
                    Explore Services
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Booking Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Booking Details
            </DialogTitle>
          </DialogHeader>
          {detailBooking && (
            <div className="space-y-4 py-2">
              {/* Service & Status */}
              <div className="rounded-lg bg-slate-50 p-4 space-y-3">
                <h3 className="font-black text-slate-900 text-base">
                  {detailBooking.serviceName || "N/A"}
                </h3>
                {detailBooking.serviceId?.name &&
                  detailBooking.serviceId.name !==
                    detailBooking.serviceName && (
                    <p className="text-xs text-slate-500">
                      {detailBooking.serviceId.name}
                    </p>
                  )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Status
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-black uppercase ${
                        detailBooking.status === "confirmed"
                          ? detailBooking.bookingType === "free-consultation"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                          : detailBooking.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : detailBooking.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : detailBooking.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {detailBooking.bookingType === "free-consultation" &&
                      detailBooking.status === "confirmed"
                        ? "Accepted"
                        : detailBooking.bookingType ===
                              "subscription-covered" &&
                            detailBooking.status === "pending"
                          ? "Pending Review"
                          : detailBooking.status || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Booking Type
                    </p>
                    <p className="mt-1 font-semibold text-slate-800 capitalize">
                      {detailBooking.bookingType?.replace(/-/g, " ") ||
                        "Standard"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Date
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {new Date(detailBooking.date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Time
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {detailBooking.time || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                  Payment Info
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Amount Paid
                    </p>
                    <p className="mt-1 font-black text-slate-900 text-base">
                      ₹
                      {(
                        detailBooking.finalAmount ??
                        detailBooking.amount ??
                        0
                      ).toLocaleString()}
                    </p>
                    {detailBooking.discountAmount > 0 && (
                      <p className="text-xs text-slate-400 line-through">
                        ₹{detailBooking.amount?.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Payment Status
                    </p>
                    <p className="mt-1 font-semibold text-slate-800 capitalize">
                      {detailBooking.paymentStatus || "—"}
                    </p>
                  </div>
                  {detailBooking.couponCode && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Coupon Used
                      </p>
                      <p className="mt-1 font-semibold text-green-600">
                        {detailBooking.couponCode}
                      </p>
                    </div>
                  )}
                  {detailBooking.discountAmount > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Discount
                      </p>
                      <p className="mt-1 font-semibold text-green-600">
                        –₹{detailBooking.discountAmount?.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Therapist & Service Info */}
              {(detailBooking.therapistName || detailBooking.serviceId) && (
                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                    Service Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {detailBooking.therapistName && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Therapist
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {detailBooking.therapistName}
                        </p>
                      </div>
                    )}
                    {(detailBooking.serviceId?.duration ||
                      detailBooking.subscriptionInfo?.planDuration ||
                      detailBooking.planDuration) && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Duration
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {/* Priority: service duration > subscription/plan duration > timeSlot calculation */}
                          {detailBooking.serviceId?.duration ||
                            detailBooking.subscriptionInfo?.planDuration ||
                            detailBooking.planDuration ||
                            (detailBooking.timeSlot?.start &&
                            detailBooking.timeSlot?.end
                              ? (() => {
                                  const [startHours, startMinutes] =
                                    detailBooking.timeSlot.start
                                      .split(":")
                                      .map(Number);
                                  const [endHours, endMinutes] =
                                    detailBooking.timeSlot.end
                                      .split(":")
                                      .map(Number);
                                  const duration =
                                    endHours * 60 +
                                    endMinutes -
                                    (startHours * 60 + startMinutes);
                                  return `${duration} min`;
                                })()
                              : "45 min")}
                        </p>
                      </div>
                    )}
                    {detailBooking.serviceId?.validity && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Validity
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {detailBooking.serviceId.validity} days
                        </p>
                      </div>
                    )}
                    {detailBooking.expiryDate && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Expires
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {new Date(
                            detailBooking.expiryDate,
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {detailBooking.notes && (
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-slate-700">
                    {detailBooking.notes}
                  </p>
                </div>
              )}

              {/* Booking Date */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Booked on{" "}
                  {new Date(detailBooking.createdAt).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                </span>
                {/* <span>ID: {detailBooking._id}</span> */}
              </div>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface BookingsSectionProps {
  bookingList: any[];
}

export function BookingsSection({ bookingList }: BookingsSectionProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

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
      (b) => b.status === "confirmed" && !b.sessionCreated
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

          {bookingList.filter((b) => b.status === "confirmed")
            .length > 0 && (
            <Badge className="bg-green-100 text-green-700 font-black flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {
                bookingList.filter(
                  (b) => b.status === "confirmed"
                ).length
              }{" "}
              Confirmed
            </Badge>
          )}
        </div>

        {/* CREATE SESSION BUTTON */}
        <Button
          size="sm"
          className="rounded-xl font-black"
          disabled={
            bookingList.filter(
              (b) => b.status === "confirmed" && !b.sessionCreated
            ).length === 0
          }
          onClick={handleCreateSession}
        >
          Create Session
        </Button>
      </div>

      {/* TABLE */}
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
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Therapist
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {bookingList.map((booking) => (
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
                      {new Date(booking.date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                      <br />
                      <span className="text-xs">
                        {booking.time}
                      </span>
                    </td>

                    {/* THERAPIST */}
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {booking.therapistName || "N/A"}
                    </td>

                    {/* AMOUNT */}
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-slate-900">
                        ₹{booking.amount || 0}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase
                        ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              <Button
                className="h-11 rounded-xl px-8 font-black"
              >
                <a href="/services">Explore Services</a>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
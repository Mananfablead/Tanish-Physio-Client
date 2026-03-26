import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Play, Calendar, VideoIcon, Activity, Clock, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpcomingSessionsSectionProps {
  upcomingSessions: any[];
  liveSessions: any[];
  nextSession: any;
}

export function UpcomingSessionsSection({ upcomingSessions, liveSessions, nextSession }: UpcomingSessionsSectionProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [detailSession, setDetailSession] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const openSessionDetail = (session: any) => {
    setDetailSession(session);
    setIsDetailModalOpen(true);
  };

  // Update current time every second for real-time button updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const formatSessionDateTime = (startTime?: string, endTime?: string) => {
    if (!startTime) return "-";

    const startDate = new Date(startTime);
    const endDate = endTime ? new Date(endTime) : null;

    const dateStr = startDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

    const startTimeStr = startDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });

    const endTimeStr = endDate
      ? endDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC",
        })
      : "-";

    return `${dateStr} - ${startTimeStr} `;
  };

  const isSessionTimeArrived = (session: any) => {
    if (!session?.startTime) return false;

    const sessionStartTime = new Date(session.startTime);

    // Use currentTime state instead of new Date() for real-time updates
    return currentTime >= sessionStartTime;
  };

  const InfoBlock = ({
    label,
    value,
    subValue,
    icon: Icon,
    iconColor = "text-primary",
  }: {
    label: string;
    value: React.ReactNode;
    subValue?: string;
    icon: any;
    iconColor?: string;
  }) => (
    <div className="rounded-xl border border-slate-100 bg-slate-100 p-2 flex gap-3 items-start transition-all hover:bg-slate-200">
      <div
        className={`h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
          {label}
        </p>
        <div className="font-black text-slate-900 truncate">{value}</div>
        {subValue && (
          <p className="text-xs font-bold text-primary mt-0.5">{subValue}</p>
        )}
      </div>
    </div>
  );

  // Use the liveSessions and upcomingSessions passed from parent
  // upcomingSessions already contains pending and scheduled sessions
  // liveSessions already contains live sessions

  return (
    <>
      {/* Live Sessions Section - Same UI as Next Session */}
      {liveSessions.length > 0 && (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between overflow-hidden">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Live Sessions
              </h3>
              <Badge className="bg-primary/10 text-primary hover:text-white border-none font-bold">
                live
              </Badge>
            </div>

            {liveSessions.map((session) => (
              <div key={session._id || session.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <InfoBlock
                    label="Date & Time"
                    value={new Date(
                      session.startTime || session.date,
                    ).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                    subValue={`${new Date(
                      session.startTime || session.date,
                    ).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "UTC",
                    })} — ${new Date(
                      session.endTime || session.date,
                    ).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "UTC",
                    })}`}
                    icon={Calendar}
                    iconColor="text-primary"
                  />
                  <InfoBlock
                    label="Session Type"
                    value={session.location || session.type || "Online"}
                    subValue={
                      session.type === "group"
                        ? "Group Consultation"
                        : "1 on 1 Consultation"
                    }
                    icon={VideoIcon}
                    iconColor="text-accent"
                  />
                  <div className="md:col-span-2">
                    <InfoBlock
                      label="Session Focus"
                      value={
                        session.subscriptionId?.planName ||
                        "General Consultation"
                      }
                      subValue={
                        session.notes ||
                        session.description ||
                        "Status updated to live"
                      }
                      icon={Activity}
                      iconColor="text-success"
                    />
                  </div>
                </div>

                <div className="flex gap-3 w-full border-t border-slate-50 pt-4">
                  <Link
                    to={
                      session._id && isSessionTimeArrived(session)
                        ? session.groupSessionId ||
                          session.type === "group" ||
                          session.sessionType === "group"
                          ? `/group-video-call/${session.groupSessionId || session._id}`
                          : `/video-call?sessionId=${session._id}`
                        : "#"
                    }
                    className="flex-1"
                  >
                    <Button
                      className={`w-full h-11 rounded-xl ${
                        isSessionTimeArrived(session)
                          ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-black"
                          : "bg-secondary hover:bg-secondary/90 font-bold"
                      }`}
                      disabled={!session._id || !isSessionTimeArrived(session)}
                    >
                      <Play className="h-5 w-5 mr-2 fill-white" />
                      {(() => {
                        const diffMs =
                          new Date(session.startTime).getTime() -
                          currentTime.getTime();
                        const diffMins = Math.max(
                          0,
                          Math.ceil(diffMs / (1000 * 60)),
                        );

                        if (!isSessionTimeArrived(session)) {
                          return diffMins === 0
                            ? "Starting now"
                            : `Join in ${diffMins} min`;
                        }
                        return "Join Session";
                      })()}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="h-11 px-4"
                    onClick={() => openSessionDetail(session)}
                  >
                    <Info className="h-5 w-5 mr-2" />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming Sessions Section - Show pending and scheduled sessions */}
      {upcomingSessions.length > 0 && (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Upcoming Sessions
              </h3>
            </div>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session._id || session.id}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-white hover:shadow-sm transition"
                >
                  {/* Therapist + Session Info */}
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900">
                      {session?.subscriptionId?.planName ||
                        session?.bookingId?.serviceName ||
                        "Session"}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">
                      {formatSessionDateTime(
                        session?.startTime,
                        session?.endTime,
                      )}
                    </p>
                  </div>

                  {/* Status and Timing */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {session.status}
                    </span>
                    {session.timingStatus === "join_now" &&
                      !isSessionTimeArrived(session) && (
                        <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                          {(() => {
                            const diffMs =
                              new Date(session.startTime).getTime() -
                              currentTime.getTime();
                            const diffMins = Math.max(
                              0,
                              Math.ceil(diffMs / (1000 * 60)),
                            );
                            return diffMins === 0
                              ? "Starting now"
                              : `Starts in ${diffMins} min`;
                          })()}
                        </span>
                      )}
                    {session.timingStatus === "join_soon" && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        Join soon
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-bold text-slate-500 hover:text-primary hover:bg-primary/10 h-7 px-2 text-xs"
                      onClick={() => openSessionDetail(session)}
                    >
                      <Info className="h-3 w-3 mr-1" />
                      Read More
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Next Session Detail View - Only show if there's a next session and no other upcoming sessions */}
      {nextSession &&
      upcomingSessions.filter(
        (session) =>
          session.status !== "live" && session.status !== "completed",
      ).length === 0 ? (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6  flex flex-col justify-between overflow-hidden">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Next Session
              </h3>
              <Badge className="bg-primary/10 text-primary hover:text-white border-none font-bold">
                {nextSession.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoBlock
                label="Date & Time"
                value={new Date(
                  nextSession.startTime || nextSession.date,
                ).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })}
                subValue={`${new Date(
                  nextSession.startTime || nextSession.date,
                ).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC",
                })} — ${new Date(
                  nextSession.endTime || nextSession.date,
                ).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC",
                })}`}
                icon={Calendar}
                iconColor="text-primary"
              />
              <InfoBlock
                label="Session Type"
                value={nextSession.location || nextSession.type || "Online"}
                subValue="1 on 1 Consultation"
                icon={VideoIcon}
                iconColor="text-accent"
              />
              <div className="md:col-span-2">
                <InfoBlock
                  label="Session Focus"
                  value={
                    nextSession.subscriptionId?.planName ||
                    "General Consultation"
                  }
                  subValue={
                    nextSession.notes ||
                    nextSession.description ||
                    "Status updated to live"
                  }
                  icon={Activity}
                  iconColor="text-success"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full  border-t border-slate-50">
              <Link
                to={
                  nextSession._id && isSessionTimeArrived(nextSession)
                    ? nextSession.groupSessionId ||
                      nextSession.type === "group" ||
                      nextSession.sessionType === "group"
                      ? `/group-video-call/${nextSession.groupSessionId || nextSession._id}`
                      : `/video-call?sessionId=${nextSession._id}`
                    : "#"
                }
                className="flex-1"
              >
                <Button
                  className={`w-full h-11 rounded-xl ${
                    // Enabled states
                    (nextSession.timingStatus === "join_now" ||
                      nextSession.timingStatus === "join_soon") &&
                    isSessionTimeArrived(nextSession)
                      ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-black"
                      : (nextSession.timingStatus === "join_now" ||
                            nextSession.timingStatus === "join_soon") &&
                          !isSessionTimeArrived(nextSession)
                        ? "bg-secondary hover:bg-secondary/90 font-bold"
                        : "font-bold"
                  }`}
                  disabled={
                    !nextSession._id ||
                    nextSession.timingStatus === "normal" ||
                    (nextSession.status === "live" &&
                      !isSessionTimeArrived(nextSession))
                  }
                >
                  <Play className="h-5 w-5 mr-2 fill-white" />
                  {(() => {
                    const diffMs =
                      new Date(nextSession.startTime).getTime() -
                      currentTime.getTime();
                    const diffMins = Math.max(
                      0,
                      Math.ceil(diffMs / (1000 * 60)),
                    );

                    if (
                      nextSession.status === "live" &&
                      !isSessionTimeArrived(nextSession)
                    ) {
                      return diffMins === 0
                        ? "Starting now"
                        : `Starts in ${diffMins} min`;
                    }

                    if (nextSession.timingStatus === "join_now") {
                      if (isSessionTimeArrived(nextSession)) {
                        return "Join Session";
                      }
                      return diffMins === 0
                        ? "Starting now"
                        : `Join in ${diffMins} min`;
                    }

                    if (nextSession.timingStatus === "join_soon") {
                      return "Join Soon";
                    }

                    return "Join Session";
                  })()}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        liveSessions.length === 0 &&
        upcomingSessions.length === 0 && (
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Upcoming Sessions
                </h3>
              </div>
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">
                    No Upcoming Sessions
                  </h3>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto">
                    You don't have any sessions scheduled at the moment.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )
      )}
      {/* Session Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Session Details
            </DialogTitle>
          </DialogHeader>
          {detailSession && (
            <div className="space-y-4 py-2">
              {/* Overview */}
              <div className="rounded-lg bg-slate-50 p-4 space-y-3">
                <h3 className="font-black text-slate-900 text-base">
                  {detailSession?.subscriptionId?.planName ||
                    detailSession?.bookingId?.serviceName ||
                    "Session"}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Status
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-black uppercase ${
                        detailSession.status === "live"
                          ? "bg-green-600 text-white"
                          : detailSession.status === "confirmed"
                            ? "bg-primary/10 text-primary"
                            : detailSession.status === "scheduled"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {detailSession.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Type
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {detailSession.type || "1-on-1"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Date
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {detailSession.startTime
                        ? new Date(detailSession.startTime).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              timeZone: "UTC",
                            },
                          )
                        : detailSession.date
                          ? new Date(detailSession.date).toLocaleDateString(
                              "en-US",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                timeZone: "UTC",
                              },
                            )
                          : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Time
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {detailSession.time ||
                        (detailSession.startTime
                          ? new Date(
                              detailSession.startTime,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "UTC",
                            })
                          : "—")}
                    </p>
                  </div>
                  {detailSession.duration && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Duration
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {detailSession.duration} min
                      </p>
                    </div>
                  )}
                  {detailSession.endTime && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        End Time
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {new Date(detailSession.endTime).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "UTC",
                          },
                        )}
                      </p>
                    </div>
                  )}
                  {detailSession.location && (
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Location
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {detailSession.location}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timing status badge */}
              {detailSession.timingStatus &&
                detailSession.timingStatus !== "normal" && (
                  <div className="flex items-center gap-2">
                    {detailSession.timingStatus === "join_now" && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                        {(() => {
                          const diffMs =
                            new Date(detailSession.startTime).getTime() -
                            currentTime.getTime();
                          const diffMins = Math.max(
                            0,
                            Math.ceil(diffMs / (1000 * 60)),
                          );
                          if (isSessionTimeArrived(detailSession)) {
                            return "Ready to join";
                          }
                          return diffMins === 0
                            ? "Starting now"
                            : `Starts in ${diffMins} min`;
                        })()}
                      </span>
                    )}
                    {detailSession.timingStatus === "join_soon" && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        Join Soon
                      </span>
                    )}
                  </div>
                )}

              {/* Booking Info */}
              {detailSession.bookingId && (
                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                    Booking Info
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {detailSession.bookingId.serviceName && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Service
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {detailSession.bookingId.serviceName}
                        </p>
                      </div>
                    )}
                    {detailSession.bookingId.therapistName && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Therapist
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {detailSession.bookingId.therapistName}
                        </p>
                      </div>
                    )}
                    {detailSession.bookingId.amount != null && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Amount
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          ₹
                          {detailSession.bookingId.finalAmount ??
                            detailSession.bookingId.amount}
                        </p>
                      </div>
                    )}
                    {detailSession.bookingId.paymentStatus && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Payment
                        </p>
                        <p className="mt-1 font-semibold text-slate-800 capitalize">
                          {detailSession.bookingId.paymentStatus}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subscription Info */}
              {detailSession.subscriptionId && (
                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                    Plan Info
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {detailSession.subscriptionId.planName && (
                      <div className="col-span-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Plan
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {detailSession.subscriptionId.planName}
                        </p>
                      </div>
                    )}
                    {detailSession.subscriptionId.status && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Plan Status
                        </p>
                        <p className="mt-1 font-semibold text-slate-800 capitalize">
                          {detailSession.subscriptionId.status}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Google Meet */}
              {detailSession.googleMeetLink && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
                  <h4 className="font-bold text-blue-700 text-sm uppercase tracking-wide flex items-center gap-2">
                    <VideoIcon className="h-4 w-4" /> Google Meet
                  </h4>
                  <a
                    href={detailSession.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-3 py-2 rounded-lg transition-colors"
                  >
                    <VideoIcon className="h-4 w-4" />
                    Join Google Meet
                  </a>
                  {detailSession.googleMeetCode && (
                    <p className="text-sm text-blue-800">
                      Meeting Code:{" "}
                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded">
                        {detailSession.googleMeetCode}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              {detailSession.notes && (
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-slate-700">
                    {detailSession.notes}
                  </p>
                </div>
              )}

              {/* <p className="text-xs text-slate-400 text-right">Session ID: {detailSession._id}</p> */}
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
    </>
  );
}

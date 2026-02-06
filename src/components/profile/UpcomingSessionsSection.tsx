import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Play, Calendar, VideoIcon, Activity, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface UpcomingSessionsSectionProps {
  upcomingSessions: any[];
  nextSession: any;
}

export function UpcomingSessionsSection({ upcomingSessions, nextSession }: UpcomingSessionsSectionProps) {
  const formatSessionDateTime = (startTime?: string, endTime?: string) => {
    if (!startTime) return "-";

    const startDate = new Date(startTime);
    const endDate = endTime ? new Date(endTime) : null;

    const dateStr = startDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const startTimeStr = startDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const endTimeStr = endDate
      ? endDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "-";

    return `${dateStr} - ${startTimeStr} to ${endTimeStr}`;
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

  return (
    <>
      {/* Live Sessions Section - Show only sessions with "live" status */}
      {upcomingSessions.filter(session => session.status === "live").length > 0 && (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Live Sessions
              </h3>
            </div>
            <div className="space-y-4">
              {upcomingSessions
                .filter(session => session.status === "live")
                .map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-white hover:shadow-sm transition"
                >
                  {/* Therapist + Session Info */}
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900">
                      {session?.subscriptionId?.planName || "Session"}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">
                      {formatSessionDateTime(
                        session?.startTime,
                        session?.endTime
                      )}
                    </p>
                  </div>

                  {/* Status */}
                  <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Upcoming Sessions Section - Show sessions that are not "live" or "completed" */}
      {upcomingSessions.filter(session => session.status !== "live" && session.status !== "completed").length > 0 && (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Upcoming Sessions
              </h3>
            </div>
            <div className="space-y-4">
              {upcomingSessions
                .filter(session => session.status !== "live" && session.status !== "completed")
                .map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-white hover:shadow-sm transition"
                >
                  {/* Therapist + Session Info */}
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900">
                      {session?.subscriptionId?.planName || "Session"}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">
                      {formatSessionDateTime(
                        session?.startTime,
                        session?.endTime
                      )}
                    </p>
                  </div>

                  {/* Status */}
                  <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Next Session Detail View - Only show if there's a next session and no other upcoming sessions */}
      {nextSession && upcomingSessions.filter(session => session.status !== "live" && session.status !== "completed").length === 0 ? (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
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
                  nextSession.startTime || nextSession.date
                ).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                subValue={`${new Date(
                  nextSession.startTime || nextSession.date
                ).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })} — ${new Date(
                  nextSession.endTime || nextSession.date
                ).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
                icon={Calendar}
                iconColor="text-primary"
              />
              <InfoBlock
                label="Session Type"
                value={
                  nextSession.location ||
                  nextSession.type ||
                  "Online"
                }
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
            
            <div className="flex gap-3 w-full pt-6 border-t border-slate-50">
             
              <Link
                to={`/video-call?sessionId=${nextSession._id}`}
                className="flex-1"
              >
                <Button 
                  className={`w-full h-11 rounded-xl ${nextSession.timingStatus === 'join_now' ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-black' : nextSession.timingStatus === 'join_soon' ? 'bg-secondary hover:bg-secondary/90 font-bold' : 'bg-gray-300 font-bold'}`}
                  disabled={nextSession.timingStatus !== 'join_now' && nextSession.timingStatus !== 'join_soon'}
                >
                  <Play className="h-5 w-5 mr-2 fill-white" />
                  {nextSession.timingStatus === 'join_now' ? 'Join Session' : nextSession.timingStatus === 'join_soon' ? 'Join Soon' : 'Join Session'}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : upcomingSessions.filter(session => session.status !== "live" && session.status !== "completed").length === 0 && (
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
                  You don't have any sessions scheduled at the
                  moment.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

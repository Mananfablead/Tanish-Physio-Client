import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Play,
  Calendar,
  VideoIcon,
  Clock,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

interface GroupSession {
  _id: string;
  title: string;
  description: string;
  therapistId: {
    firstName: string;
    lastName: string;
  };
  startTime: string;
  endTime: string;
  status: string;
  isActiveCall: boolean;
  participants: Array<{
    userId: string;
    status: string;
  }>;
}

interface GroupSessionsSectionProps {
  groupSessions: GroupSession[];
  onJoinSession: (sessionId: string) => void;
}

export function GroupSessionsSection({
  groupSessions,
  onJoinSession,
}: GroupSessionsSectionProps) {
  const getStatusBadgeClass = (status: string, isActiveCall: boolean) => {
    if (isActiveCall) {
      return "bg-green-500 animate-pulse";
    }

    switch (status?.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "active":
        return "bg-green-500 text-white";
      case "completed":
        return "bg-gray-100 text-gray-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

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

    return `${dateStr} • ${startTimeStr} - ${endTimeStr}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Group Sessions
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Your registered group therapy sessions
          </p>
        </div>
        <Link to="/group-sessions">
          <Button
            variant="outline"
            className="font-bold border-primary text-primary hover:bg-primary hover:text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            Browse Sessions
          </Button>
        </Link>
      </div>

      {groupSessions && groupSessions.length > 0 ? (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Session
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Therapist
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Participants
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupSessions.map((session) => (
                  <tr
                    key={session._id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {session.title}
                      </div>
                      <div className="text-slate-500 text-xs mt-1 line-clamp-2">
                        {session.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">
                            {session.therapistId.firstName}{" "}
                            {session.therapistId.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {formatSessionDateTime(
                        session.startTime,
                        session.endTime
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600 text-sm">
                          {session.participants?.filter(
                            (p) => p.status === "accepted"
                          ).length || 0}{" "}
                          participants
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        className={getStatusBadgeClass(
                          session.status,
                          session.isActiveCall
                        )}
                      >
                        {session.isActiveCall
                          ? "LIVE"
                          : session.status?.toUpperCase() || "UNKNOWN"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {session.status === "scheduled" &&
                        !session.isActiveCall && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold border-primary text-primary hover:bg-primary hover:text-white"
                            onClick={() => onJoinSession(session._id)}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Join
                          </Button>
                        )}
                      {session.isActiveCall && (
                        <Link to={`/group-video-call/${session._id}`}>
                          <Button
                            size="sm"
                            className="font-bold bg-green-500 hover:bg-green-600 text-white animate-pulse"
                          >
                            <Play className="h-3 w-3 mr-1 fill-white" />
                            Join Live
                          </Button>
                        </Link>
                      )}
                      {session.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold border-slate-200 text-slate-500 hover:bg-slate-100"
                          disabled
                        >
                          <VideoIcon className="h-3 w-3 mr-1" />
                          Completed
                        </Button>
                      )}
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
                Group Sessions
              </h3>
            </div>
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Users className="h-8 w-8 text-slate-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">
                  No Group Sessions
                </h3>
                <p className="text-slate-500 font-medium">
                  You haven't registered for any group sessions yet.
                </p>
              </div>
              <Link to="/group-sessions">
                <Button className="mt-4 font-bold bg-primary hover:bg-primary/90">
                  <Users className="h-4 w-4 mr-2" />
                  Browse Group Sessions
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Download, Clock, FileVideo } from "lucide-react";
import { videoCallApi } from "@/lib/videoCallApi";

interface RecordedSessionsSectionProps {
  userId?: string;
}

interface Recording {
  _id: string;
  sessionId: {
    _id: string;
    date: string;
    time: string;
    bookingId?: {
      serviceName: string;
    };
  };
  participants: Array<{
    userId: {
      _id: string;
      name: string;
    };
    joinedAt: string;
    leftAt: string;
    duration: number;
  }>;
  callStartedAt: string;
  callEndedAt: string;
  duration: number;
  recordingUrl: string;
  recordingStatus: string;
  recordingDuration?: number;
  recordingSize?: number;
  recordingFormat?: string;
}

export function RecordedSessionsSection({
  userId,
}: RecordedSessionsSectionProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true);
        const response = await videoCallApi.getUserRecordings();
        setRecordings(response.recordings || []);
      } catch (err) {
        console.error("Error fetching recordings:", err);
        setError("Failed to load recordings");
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  const formatFileSize = (sizeInBytes?: number): string => {
    if (!sizeInBytes) return "N/A";
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024)
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Recorded Sessions
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Your recorded therapy sessions
          </p>
        </div>
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading recordings...</span>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Recorded Sessions
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Your recorded therapy sessions
          </p>
        </div>
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="text-center text-destructive">
            <FileVideo className="h-12 w-12 mx-auto text-destructive mb-2" />
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Recorded Sessions
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Your recorded therapy sessions
          </p>
        </div>
        <Badge
          variant="outline"
          className="px-4 py-1.5 rounded-full border-slate-200 text-slate-600 font-bold bg-white"
        >
          {recordings.length} Recordings
        </Badge>
      </div>
      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block">
        {recordings.length > 0 ? (
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
                      Duration
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      File Size
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recordings.map((recording) => (
                    <tr
                      key={recording._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Service */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {recording.sessionId?.bookingId?.serviceName ||
                            "Therapy Session"}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {recording.callStartedAt
                          ? formatDate(recording.callStartedAt)
                          : "N/A"}
                        <br />
                        <span className="text-xs">
                          {recording.callStartedAt
                            ? formatTime(recording.callStartedAt)
                            : "—"}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {formatDuration(recording.recordingDuration)}
                      </td>

                      {/* File Size */}
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {formatFileSize(recording.recordingSize)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant={
                            recording.recordingStatus === "completed"
                              ? "default"
                              : recording.recordingStatus === "recording"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            recording.recordingStatus === "completed"
                              ? "bg-green-100 text-green-700"
                              : recording.recordingStatus === "recording"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {recording.recordingStatus}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          {recording.recordingUrl && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="font-bold border-primary text-primary hover:bg-primary hover:text-white"
                                onClick={() => {
                                  window.open(recording.recordingUrl, "_blank");
                                }}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Watch
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="font-bold border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                                onClick={() => {
                                  // Trigger download
                                  const link = document.createElement("a");
                                  link.href = recording.recordingUrl;
                                  link.download = `recording-${recording._id}.webm`;
                                  link.click();
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </>
                          )}
                        </div>
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
                  Recorded Sessions
                </h3>
              </div>
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileVideo className="h-8 w-8 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">
                    No Recordings Yet
                  </h3>
                  <p className="text-slate-500 font-medium">
                    Your recorded therapy sessions will appear here.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
      ;{/* MOBILE CARD VIEW */}
      <div className="md:hidden">
        {recordings.length > 0 ? (
          <div className="space-y-4">
            {recordings.map((recording) => (
              <Card
                key={recording._id}
                className="p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {recording.sessionId?.bookingId?.serviceName ||
                          "Therapy Session"}
                      </h3>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          recording.recordingStatus === "completed"
                            ? "default"
                            : recording.recordingStatus === "recording"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          recording.recordingStatus === "completed"
                            ? "bg-green-100 text-green-700"
                            : recording.recordingStatus === "recording"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {recording.recordingStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Date</p>
                      <p className="text-sm text-slate-900">
                        {recording.callStartedAt
                          ? formatDate(recording.callStartedAt)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Time</p>
                      <p className="text-sm text-slate-900">
                        {recording.callStartedAt
                          ? formatTime(recording.callStartedAt)
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Duration</p>
                      <p className="text-sm text-slate-900">
                        {formatDuration(recording.recordingDuration)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">File Size</p>
                      <p className="text-sm text-slate-900">
                        {formatFileSize(recording.recordingSize)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-center space-x-2">
                      {recording.recordingUrl && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold border-primary text-primary hover:bg-primary hover:text-white flex-1"
                            onClick={() => {
                              window.open(recording.recordingUrl, "_blank");
                            }}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Watch
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white flex-1"
                            onClick={() => {
                              // Trigger download
                              const link = document.createElement("a");
                              link.href = recording.recordingUrl;
                              link.download = `recording-${recording._id}.webm`;
                              link.click();
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Recorded Sessions
                </h3>
              </div>
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileVideo className="h-8 w-8 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">
                    No Recordings Yet
                  </h3>
                  <p className="text-slate-500 font-medium">
                    Your recorded therapy sessions will appear here.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
      ;
    </div>
  );
}

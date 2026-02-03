import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthRedux } from "../hooks/useAuthRedux";
import { videoCallApi } from "../lib/videoCallApi";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { PlayIcon, DownloadIcon, EyeIcon } from "lucide-react";

interface Recording {
  _id: string;
  recordingUrl?: string;
  recordingImages?: string[];
  recordingStartTime?: string;
  recordingEndTime?: string;
  recordingDuration?: number;
  recordingSize?: number;
  recordingFormat?: string;
  callStartedAt: string;
  callEndedAt?: string;
  duration?: number;
  status: string;
  participants: Array<{
    userId: {
      name: string;
      email: string;
      phone?: string;
      status?: string;
    };
    role: string;
    duration?: number;
    joinedAt?: string;
    leftAt?: string;
  }>;
  sessionId?: {
    date: string;
    time: string;
  };
  groupSessionId?: {
    title: string;
  };
}

const RecordedSessionsPage: React.FC = () => {
  const { user } = useAuthRedux();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    fetchRecordings();
  }, [currentPage]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage.toString(),
        limit: pageSize.toString(),
      };

      const response = await videoCallApi.getUserRecordings(params);
      // Enhance the recordings data with additional participant information
      const enhancedRecordings =
        response.recordings?.map((recording: any) => ({
          ...recording,
          participants: recording.participants?.map((participant: any) => ({
            ...participant,
            // Ensure participant data is properly structured
            userId: {
              ...participant.userId,
              // Add fallbacks for additional fields that might not be present
              phone: participant.userId.phone || "",
              status: participant.userId.status || "active",
            },
          })),
        })) || [];

      setRecordings(enhancedRecordings);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err) {
      console.error("Error fetching recordings:", err);
      setError("Failed to load recordings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handlePlayRecording = (recordingUrl: string) => {
    // Open the recording in a new tab/window
    window.open(recordingUrl, "_blank");
  };

  const handleDownloadRecording = (recordingUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = recordingUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Card key={index} className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-48 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recorded Sessions</h1>
        <p className="text-gray-600 mt-2">
          View and manage your recorded therapy sessions
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchRecordings} variant="outline" className="mt-3">
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-6">
        {loading ? (
          renderSkeletons()
        ) : recordings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No recorded sessions found</div>
            <p className="text-gray-600 max-w-md mx-auto">
              You don't have any recorded therapy sessions yet. Sessions will
              appear here after they are completed and recorded.
            </p>
          </div>
        ) : (
          recordings.map((recording) => (
            <Card key={recording._id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <span className="text-lg">
                      {recording.sessionId
                        ? `Session on ${formatDate(
                            recording.sessionId.date +
                              "T" +
                              recording.sessionId.time
                          )}`
                        : recording.groupSessionId
                        ? recording.groupSessionId.title
                        : "Recorded Session"}
                    </span>
                    <div className="text-sm font-normal text-gray-500 mt-1">
                      Recorded on {formatDate(recording.callStartedAt)}
                      {recording.duration &&
                        ` • Duration: ${formatDuration(recording.duration)}`}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      recording.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : recording.status === "recording"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {recording.status.charAt(0).toUpperCase() +
                      recording.status.slice(1)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Participants:
                  </h3>
                  <div className="space-y-2">
                    {recording.participants.map((participant, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 rounded-md border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-gray-900">
                              {participant.userId.name}
                            </span>
                            <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full capitalize">
                              {participant.role}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600 grid grid-cols-2 gap-1">
                          <span>Email: {participant.userId.email}</span>
                          <span>
                            Phone: {participant.userId.phone || "N/A"}
                          </span>
                          <span>
                            Status: {participant.userId.status || "active"}
                          </span>
                          <span>
                            Duration:{" "}
                            {participant.duration
                              ? Math.round(participant.duration) + "s"
                              : "N/A"}
                          </span>
                          <span>
                            Joined:{" "}
                            {participant.joinedAt
                              ? new Date(
                                  participant.joinedAt
                                ).toLocaleTimeString()
                              : "N/A"}
                          </span>
                          <span>
                            Left:{" "}
                            {participant.leftAt
                              ? new Date(
                                  participant.leftAt
                                ).toLocaleTimeString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {recording.recordingUrl && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Recording File
                        </h3>
                        <div className="text-sm text-gray-500 mt-1">
                          {recording.recordingFormat &&
                            `Format: ${recording.recordingFormat.toUpperCase()} • `}
                          {recording.recordingSize &&
                            `Size: ${formatFileSize(
                              recording.recordingSize
                            )} • `}
                          {recording.recordingDuration &&
                            `Duration: ${formatDuration(
                              recording.recordingDuration
                            )}`}
                        </div>
                        {recording.recordingUrl && (
                          <div className="text-sm text-gray-500 mt-2">
                            <span className="font-medium">Recording URL:</span>
                            <a
                              href={recording.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline ml-2 break-all"
                            >
                              {recording.recordingUrl}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handlePlayRecording(recording.recordingUrl!)
                          }
                        >
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Play
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {recording.recordingImages &&
                  recording.recordingImages.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Recording Images
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {recording.recordingImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={imgUrl}
                              alt={`Recording snapshot ${idx + 1}`}
                              className="w-24 h-24 object-cover rounded-md border cursor-pointer"
                              onClick={() => handlePlayRecording(imgUrl)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <EyeIcon className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && recordings.length > 0 && totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecordedSessionsPage;

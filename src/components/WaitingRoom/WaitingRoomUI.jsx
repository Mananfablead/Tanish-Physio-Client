import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Clock, 
  Bell,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PatientWaitingCard from "./PatientWaitingCard";

const WaitingRoomUI = ({
  sessionId,
  socket,
  onPatientAction,
  className = "",
}) => {
  const navigate = useNavigate();
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial waiting patients
  useEffect(() => {
    if (!socket || !sessionId) return;

    const fetchWaitingPatients = () => {
      try {
        socket.emit("get-waiting-patients", { sessionId });
      } catch (err) {
        console.error("Error fetching waiting patients:", err);
        setError("Failed to fetch waiting patients");
        setLoading(false);
      }
    };

    fetchWaitingPatients();

    // Set up socket listeners
    socket.on("waiting-patients-list", (data) => {
      console.log("📥 Received waiting patients list:", data);
      setWaitingPatients(data.patients || []);
      setLoading(false);
      setError(null);
    });

    socket.on("patient-waiting", (data) => {
      console.log("📥 New patient waiting:", data);
      setWaitingPatients((prev) => {
        // Check if patient already exists
        const exists = prev.some((p) => p.socketId === data.patient.socketId);
        if (!exists) {
          return [...prev, data.patient];
        }
        return prev;
      });
    });

    socket.on("patient-approved-success", (data) => {
      console.log("📥 Patient approved:", data);
      setWaitingPatients((prev) =>
        prev.map((p) =>
          p.socketId === data.patient.socketId
            ? { ...p, status: "approved" }
            : p
        )
      );
      onPatientAction?.("approved", data.patient);
    });

    socket.on("patient-rejected-success", (data) => {
      console.log("📥 Patient rejected:", data);
      setWaitingPatients((prev) =>
        prev.map((p) =>
          p.socketId === data.patient.socketId
            ? { ...p, status: "rejected" }
            : p
        )
      );
      onPatientAction?.("rejected", data.patient);
    });

    socket.on("patient-disconnected", (data) => {
      console.log("📥 Patient disconnected:", data);
      setWaitingPatients((prev) =>
        prev.filter((p) => p.socketId !== data.patient.socketId)
      );
    });

    socket.on("error", (data) => {
      console.error("Socket error:", data);
      setError(data.message);
      setLoading(false);
    });

    // Cleanup listeners
    return () => {
      socket.off("waiting-patients-list");
      socket.off("patient-waiting");
      socket.off("patient-approved-success");
      socket.off("patient-rejected-success");
      socket.off("patient-disconnected");
      socket.off("error");
    };
  }, [socket, sessionId, onPatientAction]);

  const handleApprovePatient = (patientSocketId) => {
    if (!socket) return;

    socket.emit("approve-patient", {
      sessionId,
      patientSocketId,
    });
  };

  const handleRejectPatient = (patientSocketId) => {
    if (!socket) return;

    socket.emit("reject-patient", {
      sessionId,
      patientSocketId,
      reason: "Request rejected by therapist",
    });
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleRefresh = () => {
    if (!socket) return;

    setLoading(true);
    setError(null);
    socket.emit("get-waiting-patients", { sessionId });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Waiting Room
          </CardTitle>
          <CardDescription>Managing patient approvals</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading waiting patients...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Waiting Room
            </CardTitle>
            <CardDescription>
              Manage patient requests for session {sessionId?.substring(0, 8)}
              ...
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {waitingPatients.length} waiting
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {waitingPatients.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Patients Waiting
            </h3>
            <p className="text-gray-500">
              Patients will appear here when they request to join your session.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {waitingPatients.map((patient) => (
              <PatientWaitingCard
                key={patient.socketId}
                patient={patient}
                status={patient.status || "waiting"}
                onApprove={handleApprovePatient}
                onReject={handleRejectPatient}
                onCancel={handleCancel}
                showActions={
                  patient.status !== "approved" && patient.status !== "rejected"
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WaitingRoomUI;
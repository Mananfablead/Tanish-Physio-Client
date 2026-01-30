import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  Clock,
  Users,
  User,
  Play,
  MapPin,
  Star,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthRedux } from "@/hooks/useAuthRedux";
import api from "@/lib/api";

interface GroupSession {
  _id: string;
  title: string;
  description: string;
  therapistId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    specialization?: string;
    rating?: number;
  };
  startTime: string;
  endTime: string;
  maxParticipants: number;
  participants: Array<{
    userId: string;
    status: string;
  }>;
  status: string;
}

export default function GroupSessionDiscoveryPage() {
  const navigate = useNavigate();
  const { user } = useAuthRedux();
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchGroupSessions();
  }, []);

  const fetchGroupSessions = async () => {
    try {
      setLoading(true);
      // For now, we'll mock the data since we don't have the actual API endpoint
      // In a real implementation, this would be:
      // const response = await apiClient.get("/group-sessions/public");

      // Mock data for demonstration
      const mockSessions: GroupSession[] = [
        {
          _id: "1",
          title: "Knee Rehabilitation Group",
          description:
            "Group session focused on knee injury recovery and strengthening exercises",
          therapistId: {
            _id: "t1",
            firstName: "Dr.",
            lastName: "Smith",
            email: "dr.smith@clinic.com",
            specialization: "Orthopedic Physiotherapy",
            rating: 4.8,
          },
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(
            Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000
          ).toISOString(),
          maxParticipants: 8,
          participants: [
            { userId: "u1", status: "accepted" },
            { userId: "u2", status: "accepted" },
            { userId: "u3", status: "pending" },
          ],
          status: "scheduled",
        },
        {
          _id: "2",
          title: "Back Pain Management",
          description:
            "Learn effective techniques for managing chronic back pain in a group setting",
          therapistId: {
            _id: "t2",
            firstName: "Dr.",
            lastName: "Johnson",
            email: "dr.johnson@clinic.com",
            specialization: "Manual Therapy",
            rating: 4.9,
          },
          startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(
            Date.now() + 48 * 60 * 60 * 1000 + 90 * 60 * 1000
          ).toISOString(),
          maxParticipants: 12,
          participants: [
            { userId: "u4", status: "accepted" },
            { userId: "u5", status: "accepted" },
          ],
          status: "scheduled",
        },
        {
          _id: "3",
          title: "Sports Injury Prevention",
          description:
            "Group training session on preventing common sports injuries",
          therapistId: {
            _id: "t3",
            firstName: "Dr.",
            lastName: "Williams",
            email: "dr.williams@clinic.com",
            specialization: "Sports Physiotherapy",
            rating: 4.7,
          },
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          maxParticipants: 10,
          participants: [
            { userId: "u6", status: "accepted" },
            { userId: "u7", status: "accepted" },
            { userId: "u8", status: "accepted" },
          ],
          status: "completed",
        },
      ];

      setSessions(mockSessions);
    } catch (error) {
      console.error("Error fetching group sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = (sessionId: string) => {
    // Navigate to registration page
    navigate(`/group-sessions/register/${sessionId}`);
  };

  const handleViewSession = (sessionId: string) => {
    // Navigate to session details page
    navigate(`/group-sessions/${sessionId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case "active":
        return <Badge className="bg-green-500 animate-pulse">Live Now</Badge>;
      case "completed":
        return <Badge className="bg-gray-500">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-500">Unknown</Badge>;
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.therapistId.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      session.therapistId.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter = filter === "all" || session.status === filter;
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "knee" &&
        session.title.toLowerCase().includes("knee")) ||
      (selectedCategory === "back" &&
        session.title.toLowerCase().includes("back")) ||
      (selectedCategory === "sports" &&
        session.title.toLowerCase().includes("sports"));

    return matchesSearch && matchesFilter && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Group Therapy Sessions
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Join our community-based therapy sessions led by expert
          physiotherapists. Connect with others facing similar challenges and
          accelerate your recovery together.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search group sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-3 text-lg"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Filter by:
            </span>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Sessions</option>
            <option value="scheduled">Upcoming</option>
            <option value="active">Live Now</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            <option value="knee">Knee Rehabilitation</option>
            <option value="back">Back Pain</option>
            <option value="sports">Sports Injury</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSessions.map((session) => (
          <Card
            key={session._id}
            className="overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {session.title}
                </h3>
                {getStatusBadge(session.status)}
              </div>

              <p className="text-gray-600 mb-6 line-clamp-3">
                {session.description}
              </p>

              {/* Therapist Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {session.therapistId.firstName}{" "}
                      {session.therapistId.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {session.therapistId.specialization}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {session.therapistId.rating}
                  </span>
                  <span className="text-sm text-gray-500">(50+ reviews)</span>
                </div>
              </div>

              {/* Session Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(session.startTime).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(session.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(session.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {
                      session.participants.filter(
                        (p) => p.status === "accepted"
                      ).length
                    }{" "}
                    / {session.maxParticipants} participants
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>Online Session</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleViewSession(session._id)}
                >
                  View Details
                </Button>

                {session.status === "scheduled" && (
                  <Button
                    className="flex-1 flex items-center gap-2"
                    onClick={() => handleJoinSession(session._id)}
                    disabled={
                      session.participants.filter(
                        (p) => p.status === "accepted"
                      ).length >= session.maxParticipants
                    }
                  >
                    <Play className="h-4 w-4" />
                    Join Session
                  </Button>
                )}
              </div>

              {/* Participant indicator */}
              {session.status === "active" && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">
                      Session Live
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500">
                        {
                          session.participants.filter(
                            (p) => p.status === "accepted"
                          ).length
                        }{" "}
                        participants
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-16">
          <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No group sessions found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filter !== "all" || selectedCategory !== "all"
              ? "Try adjusting your search or filters"
              : "Check back later for new group sessions"}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setFilter("all");
              setSelectedCategory("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Benefits Section */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Why Join Group Sessions?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Community Support</h3>
            <p className="text-gray-600">
              Connect with others facing similar challenges and share
              experiences
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Expert Guidance</h3>
            <p className="text-gray-600">
              Learn from certified physiotherapists in a structured group
              environment
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Cost Effective</h3>
            <p className="text-gray-600">
              Affordable group pricing with the same quality care
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Copy, Check } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { io } from "socket.io-client";

interface GoogleMeetDisplayProps {
  sessionId: string;
  className?: string;
}

export function GoogleMeetDisplay({
  sessionId,
  className = "",
}: GoogleMeetDisplayProps) {
  const [googleMeetData, setGoogleMeetData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const sessions = useSelector((state: any) => state.sessions.sessions || []);

  useEffect(() => {
    // Setup socket listener for Google Meet updates
    const socket = io(
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
      {
        transports: ["websocket", "polling"],
        auth: {
          token: localStorage.getItem("token"),
        },
      }
    );

    socket.on("connect", () => {
      console.log("Socket connected for Google Meet updates");

      // Join user notification room using correct event name
      socket.emit("join-notifications", {});
      console.log("Sent join-notifications event");
    });

    socket.on("notifications-joined", (data) => {
      console.log("Successfully joined notifications:", data);
    });

    // Listen for Google Meet updated events
    socket.on("client-notification", (data: any) => {
      if (data.type === "google_meet_updated" && data.sessionId === sessionId) {
        console.log("Google Meet link updated via socket:", data);

        // Update local state with new link
        const newData = {
          link: data.googleMeetLink,
          code: data.googleMeetCode,
          timestamp: new Date().toISOString(),
        };
        setGoogleMeetData(newData);

        // Update localStorage
        const storageKey = `google_meet_link_${sessionId}`;
        try {
          localStorage.setItem(storageKey, JSON.stringify(newData));
        } catch (err) {
          console.error("Failed to update google meet data in storage", err);
        }

        // Show toast notification
        toast({
          title: "Google Meet Link Updated",
          description:
            "Your therapist has updated the Google Meet link for your session.",
        });
      }
    });

    // Cleanup socket on unmount
    return () => {
      socket.off("connect");
      socket.off("notifications-joined");
      socket.off("client-notification");
      socket.disconnect();
    };
  }, [sessionId]);

  useEffect(() => {
    // Priority 1: Always check sessions state first (most up-to-date)
    const sess = sessions.find(
      (s: any) => s._id === sessionId || s.sessionId === sessionId
    );
    if (sess && sess.googleMeetLink) {
      console.log(
        "📊 GoogleMeetDisplay: Found session with link:",
        sess.googleMeetLink
      );
      const data = {
        link: sess.googleMeetLink,
        code: sess.googleMeetCode,
        timestamp: new Date().toISOString(),
      };
      setGoogleMeetData(data);
      try {
        localStorage.setItem(
          `google_meet_link_${sessionId}`,
          JSON.stringify(data)
        );
        console.log("✅ GoogleMeetDisplay: Updated localStorage with:", data);
      } catch (err) {
        console.error("Failed to write google meet data to storage", err);
      }
      return;
    } else {
      console.log("ℹ️ GoogleMeetDisplay: No session data found in state");
    }

    // Priority 2: If no session data, check localStorage as fallback
    const storageKey = `google_meet_link_${sessionId}`;
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      console.log(
        "📦 GoogleMeetDisplay: Using localStorage fallback:",
        storedData
      );
      try {
        const parsedData = JSON.parse(storedData);
        setGoogleMeetData(parsedData);
      } catch (error) {
        console.error("Error parsing Google Meet data:", error);
      }
    } else {
      console.log("ℹ️ GoogleMeetDisplay: No localStorage data found");
    }
  }, [sessionId, sessions]);

  const copyToClipboard = async () => {
    if (!googleMeetData?.link) return;

    try {
      await navigator.clipboard.writeText(googleMeetData.link);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Google Meet link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  if (!googleMeetData?.link) {
    return null;
  }

  // Check if link has expired
  const isExpired =
    googleMeetData.timestamp &&
    new Date(googleMeetData.timestamp).getTime() <
      Date.now() - 24 * 60 * 60 * 1000; // 24 hours

  return (
    // <Card className={`p-4 ${className}`}>
    //   <div className="flex flex-col gap-3">
    //     <div className="flex items-center justify-between">
    //       <div className="flex items-center gap-2">
    //         <Video className="h-5 w-5 text-blue-600" />
    //         <h3 className="font-bold text-lg">Google Meet Alternative</h3>
    //       </div>
    //       <Badge variant={isExpired ? "destructive" : "default"}>
    //         {isExpired ? "Expired" : "Available"}
    //       </Badge>
    //     </div>

    //     {!isExpired ? (
    //       <>
    //         <div className="bg-blue-50 rounded-lg p-3">
    //           <p className="text-sm text-blue-800 mb-2">
    //             Your therapist has arranged an alternative Google Meet session.
    //           </p>
    //           <div className="flex items-center gap-2">
    //             <a
    //               href={googleMeetData.link}
    //               target="_blank"
    //               rel="noopener noreferrer"
    //               className="inline-flex items-center gap-2
    //                 bg-blue-600 hover:bg-blue-700
    //                 text-white font-medium text-sm
    //                 px-3 py-2 rounded-lg
    //                 transition-colors"
    //             >
    //               <Video className="h-4 w-4" />
    //               Join Google Meet
    //             </a>
    //             <Button
    //               variant="outline"
    //               size="sm"
    //               onClick={copyToClipboard}
    //               className="flex items-center gap-2"
    //             >
    //               {copied ? (
    //                 <>
    //                   <Check className="h-4 w-4 text-green-600" />
    //                   Copied!
    //                 </>
    //               ) : (
    //                 <>
    //                   <Copy className="h-4 w-4" />
    //                   Copy Link
    //                 </>
    //               )}
    //             </Button>
    //           </div>
    //         </div>

    //         {googleMeetData.code && (
    //           <div className="text-sm text-gray-600">
    //             <span className="font-medium">Meeting Code:</span>{" "}
    //             {googleMeetData.code}
    //           </div>
    //         )}
    //       </>
    //     ) : (
    //       <div className="bg-red-50 rounded-lg p-3">
    //         <p className="text-sm text-red-800">
    //           This Google Meet link has expired. Please contact your therapist
    //           for a new link.
    //         </p>
    //       </div>
    //     )}
    //   </div>
    // </Card>
    <></>
  );
}

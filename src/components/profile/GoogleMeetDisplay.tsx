import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Copy, Check } from "lucide-react";
import { toast } from "../../hooks/use-toast";

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

  useEffect(() => {
    // Check if Google Meet link exists in localStorage
    const storedData = localStorage.getItem(`google_meet_link_${sessionId}`);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setGoogleMeetData(parsedData);
      } catch (error) {
        console.error("Error parsing Google Meet data:", error);
      }
    }
  }, [sessionId]);

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
    <Card className={`p-4 ${className}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-lg">Google Meet Alternative</h3>
          </div>
          <Badge variant={isExpired ? "destructive" : "default"}>
            {isExpired ? "Expired" : "Available"}
          </Badge>
        </div>

        {!isExpired ? (
          <>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800 mb-2">
                Your therapist has arranged an alternative Google Meet session.
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={googleMeetData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2
                    bg-blue-600 hover:bg-blue-700
                    text-white font-medium text-sm
                    px-3 py-2 rounded-lg
                    transition-colors"
                >
                  <Video className="h-4 w-4" />
                  Join Google Meet
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            {googleMeetData.code && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Meeting Code:</span>{" "}
                {googleMeetData.code}
              </div>
            )}
          </>
        ) : (
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-sm text-red-800">
              This Google Meet link has expired. Please contact your therapist
              for a new link.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

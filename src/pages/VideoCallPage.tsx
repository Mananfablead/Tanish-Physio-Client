import React, { useState } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Users,
  Settings,
  Share,
  MoreVertical,
  X
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function VideoCallPage() {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  const handleEndCall = () => {
    navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold">Session with Dr. Sarah Johnson</h1>
            <p className="text-sm text-gray-400">Dec 30, 2024 • 10:00 AM</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`text-white hover:bg-gray-800 ${showParticipants ? 'bg-gray-700' : ''}`}
            onClick={() => {
              setShowParticipants(!showParticipants);
              setShowChat(false);
              setShowSettings(false);
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            Participants
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-white hover:bg-gray-800 ${showChat ? 'bg-gray-700' : ''}`}
            onClick={() => {
              setShowChat(!showChat);
              setShowParticipants(false);
              setShowSettings(false);
            }}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800"
            onClick={() => {
              setShowSettings(!showSettings);
              setShowParticipants(false);
              setShowChat(false);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-gray-800 flex">
        {/* Main Video */}
        <div className={`flex-1 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center transition-all duration-300 ${showParticipants || showChat ? 'mr-80' : ''}`}>
          <div className="text-center text-white">
            <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Dr. Sarah Johnson</h2>
            <p className="text-gray-400">Therapist</p>
          </div>
        </div>

        {/* Side Panels */}
        {showParticipants && (
          <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Participants (2)</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800"
                  onClick={() => setShowParticipants(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">SJ</span>
                </div>
                <div>
                  <p className="text-white font-medium">Dr. Sarah Johnson</p>
                  <p className="text-gray-400 text-sm">Host</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">JD</span>
                </div>
                <div>
                  <p className="text-white font-medium">John Doe</p>
                  <p className="text-gray-400 text-sm">You</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showChat && (
          <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Chat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800"
                  onClick={() => setShowChat(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              <div className="text-gray-400 text-sm text-center">No messages yet</div>
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Self Video */}
        <div className="absolute bottom-4 right-4 w-64 h-48 bg-gray-700 rounded-lg overflow-hidden border-2 border-white">
          <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-gray-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <Video className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-sm">You</p>
            </div>
          </div>
          {!cameraOn && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Mic */}
          <Button
            variant={micOn ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setMicOn(!micOn)}
          >
            {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          {/* Camera */}
          <Button
            variant={cameraOn ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setCameraOn(!cameraOn)}
          >
            {cameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>

          {/* Share Screen */}
          <Button
            variant={screenSharing ? "default" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setScreenSharing(!screenSharing)}
          >
            <Share className="h-6 w-6" />
          </Button>

          {/* Settings */}
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-6 w-6" />
          </Button>

          {/* End Call */}
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14 ml-4"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-800"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Microphone</span>
                <Button
                  variant={micOn ? "secondary" : "destructive"}
                  size="sm"
                  onClick={() => setMicOn(!micOn)}
                >
                  {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Camera</span>
                <Button
                  variant={cameraOn ? "secondary" : "destructive"}
                  size="sm"
                  onClick={() => setCameraOn(!cameraOn)}
                >
                  {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Screen Sharing</span>
                <Button
                  variant={screenSharing ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setScreenSharing(!screenSharing)}
                >
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Mail, Phone, Activity, Calendar, Clock, Video, Play } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface ProfileHeaderProps {
  user: any;
  activePlan: any;
  upcomingSessions: any[];
  sessionCompleted: any[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  liveSession?: any; // Add live session prop
}

export function ProfileHeader({
  user,
  activePlan,
  upcomingSessions,
  sessionCompleted,
  onImageChange,
  liveSession
}: ProfileHeaderProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      console.error("Please select a valid image");
      return;
    }

    // ✅ INSTANT PREVIEW
    const localPreview = URL.createObjectURL(file);
    setPreviewImage(localPreview);

    onImageChange(e);
  };

  return (
    <div className="relative overflow-hidden bg-primary pt-16 pb-32">
      {/* Background Patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="container relative z-10">
        
        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary via-accent to-primary rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500 animate-gradient-xy" />
            <div className="relative">
              <Avatar className="h-40 w-40 rounded-3xl border-4 border-slate-800 shadow-2xl relative overflow-hidden">
                <AvatarImage
                  src={previewImage || user?.profilePicture}
                  alt={user?.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-5xl font-black bg-slate-800 text-primary">
                  {user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl shadow-2xl bg-primary hover:bg-primary/90 text-white border-4 border-slate-900"
                onClick={() =>
                  document.getElementById("profile-image-upload")?.click()
                }
              >
                <Camera className="h-6 w-6" />
              </Button>
              <input
                type="file"
                id="profile-image-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="text-center lg:text-left space-y-4 flex-1">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <h1 className="text-5xl font-black text-white tracking-tight">
                  {user?.name}
                </h1>
                {/* Live Session Join Button */}

              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-white font-bold">
                <p className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                  <Mail className="h-4 w-4 text-white" /> {user?.email}
                </p>
                <p className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                  <Phone className="h-4 w-4 text-white" /> {user?.phone}
                </p>
              </div>
            </div>
          </div>
         {liveSession && (
  <Link
    to={`/video-call?sessionId=${liveSession._id}`}
    className="ml-4 bg-white hover:bg-white/90 text-primary font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg"
  >
    <Play className="h-5 w-5" />
    Join Now
  </Link>
)}
          {/* Stats Section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
            {[
              {
                label: "Active Plans",
                value: activePlan ? "1" : "0",
                icon: Activity,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                label: "Completed",
                value: sessionCompleted.length,
                icon: Calendar,
                color: "text-accent",
                bg: "bg-accent/10",
              },
              {
                label: "Upcoming",
                value: upcomingSessions.length,
                icon: Clock,
                color: "text-success",
                bg: "bg-success/10",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 
             hover:shadow-md transition-all group shadow-sm
             flex flex-col items-center text-center"
              >
                <div
                  className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3
               group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>

                <p className="text-2xl font-black text-primary leading-none">
                  {stat.value}
                </p>

                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
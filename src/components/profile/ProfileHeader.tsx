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
    <div className="relative overflow-hidden bg-primary pt-5 md:pt-16 pb-24 md:pb-32">
      {/* Background Patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="container relative z-10">
        
    <div className="flex flex-row items-center justify-between gap-4 w-full">
  
  {/* Left Section → Profile */}
  <div className="flex items-center gap-4 flex-shrink-0">
    
    {/* Profile Image */}
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-tr from-primary via-accent to-primary rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500 animate-gradient-xy" />
      
      <div className="relative">
        <Avatar className="h-20 w-20 sm:h-32 sm:w-32 lg:h-40 lg:w-40 rounded-2xl border-4 border-slate-800 shadow-xl overflow-hidden">
          <AvatarImage
            src={previewImage || user?.profilePicture}
            alt={user?.name}
            className="object-cover"
          />
          <AvatarFallback className="text-2xl sm:text-4xl font-black bg-slate-800 text-primary">
            {user?.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>

        {/* Camera Button */}
        <Button
          size="icon"
          className="absolute -bottom-1 -right-1 h-8 w-8 sm:h-10 sm:w-10 rounded-xl shadow-lg bg-primary hover:bg-primary/90 text-white border-2 border-slate-900"
          onClick={() =>
            document.getElementById("profile-image-upload")?.click()
          }
        >
          <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
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

    {/* User Info */}
    <div className="space-y-1 flex flex-col  md:ms-4">
     <div className="hidden md:flex items-center gap-2 flex-wrap ">

        <h1 className="text-xl sm:text-4xl font-black text-white tracking-tight">
          {user?.name}
        </h1>

        {liveSession && (
          <Link
            to={`/video-call?sessionId=${liveSession._id}`}
            className="bg-white hover:bg-white/90 text-primary font-bold px-3 py-1.5 sm:px-5 sm:py-2 rounded-full flex items-center gap-1 shadow text-xs sm:text-sm"
          >
            <Play className="h-3 w-3 sm:h-4 sm:w-4" />
            Join
          </Link>
        )}
      </div>

    <div className="hidden sm:flex flex-col gap-1 text-white font-semibold 
                text-xs sm:text-sm md:text-sm lg:text-base">
  <p className="flex items-center gap-1">
    <Mail className="h-4 w-4 md:h-5 md:w-5" /> 
    {user?.email}
  </p>
  <p className="flex items-center gap-1">
    <Phone className="h-4 w-4 md:h-5 md:w-5" /> 
    {user?.phone}
  </p>
</div>


    </div>
  </div>

  {/* Right Section → Stats */}
 <div className="grid grid-cols-3 gap-2 sm:gap-4 ">

  {[
    {
      label: "Active",
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
      className="bg-white/95 backdrop-blur-md 
      p-2 sm:p-4 
      rounded-lg sm:rounded-xl 
      border border-slate-200 
      hover:shadow-md transition-all group shadow-sm
      flex flex-col items-center justify-center text-center
      min-w-[70px] sm:min-w-[120px]
      "
    >
      <div
        className={`h-6 w-6 sm:h-10 sm:w-10 rounded-lg ${stat.bg} 
        flex items-center justify-center 
        mb-1 sm:mb-3
        group-hover:scale-110 transition-transform`}
      >
        <stat.icon className={`h-3 w-3 sm:h-5 sm:w-5 ${stat.color}`} />
      </div>

      <p className="text-base sm:text-2xl font-black text-primary leading-none">
        {stat.value}
      </p>

      <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">
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
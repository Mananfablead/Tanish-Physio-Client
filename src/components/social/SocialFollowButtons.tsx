import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SocialFollowButtonsProps {
  className?: string;
  variant?: "buttons" | "card" | "links";
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

const socialProfiles = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/TanishPhysioFitnessandLaserClinic",
    icon: Facebook,
    color: "bg-blue-600 hover:bg-blue-700",
    username: "TanishPhysioFitnessandLaserClinic",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/tanish_physio_fitness_clinic",
    icon: Instagram,
    color:
      "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    username: "tanish_physio_fitness_clinic",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@tanishphysiofitnessclinic3230",
    icon: Youtube,
    color: "bg-red-600 hover:bg-red-700",
    username: "tanishphysiofitnessclinic3230",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/tanishphysio",
    icon: Linkedin,
    color: "bg-blue-700 hover:bg-blue-800",
    username: "tanishphysio",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/tanishphysio",
    icon: Twitter,
    color: "bg-sky-500 hover:bg-sky-600",
    username: "tanishphysio",
  },
];

export const SocialFollowButtons = ({
  className = "",
  variant = "buttons",
  size = "md",
  showLabels = false,
}: SocialFollowButtonsProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const openSocialLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (variant === "card") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Follow Us</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {socialProfiles.map((profile) => {
              const Icon = profile.icon;
              return (
                <Button
                  key={profile.name}
                  variant="outline"
                  className={`${profile.color} border-0 text-white hover:text-white transition-all duration-200 justify-start`}
                  onClick={() => openSocialLink(profile.url)}
                >
                  <Icon size={16} className="mr-2" />
                  <span className="text-sm truncate">{profile.username}</span>
                  <ExternalLink size={12} className="ml-auto" />
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "links") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {socialProfiles.map((profile) => {
          const Icon = profile.icon;
          return (
            <a
              key={profile.name}
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${profile.color} inline-flex items-center px-3 py-2 rounded-md text-white text-sm font-medium hover:text-white transition-all duration-200 transform hover:scale-105`}
            >
              <Icon size={16} className="mr-2" />
              {showLabels && profile.name}
            </a>
          );
        })}
      </div>
    );
  }

  // Default buttons variant
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {socialProfiles.map((profile) => {
        const Icon = profile.icon;
        return (
          <Button
            key={profile.name}
            variant="outline"
            size={size === "sm" ? "sm" : "default"}
            className={`${profile.color} border-0 text-white hover:text-white transition-all duration-200 transform hover:scale-105`}
            onClick={() => openSocialLink(profile.url)}
            title={`Follow us on ${profile.name}`}
          >
            <Icon size={iconSize[size]} />
            {showLabels && (
              <span className="ml-2 hidden sm:inline">{profile.name}</span>
            )}
          </Button>
        );
      })}
    </div>
  );
};

// Individual social buttons for specific use cases
export const FacebookButton = ({ className = "" }: { className?: string }) => (
  <Button
    variant="outline"
    className="bg-blue-600 hover:bg-blue-700 border-0 text-white hover:text-white"
    onClick={() =>
      window.open(
        "https://www.facebook.com/TanishPhysioFitnessandLaserClinic",
        "_blank"
      )
    }
  >
    <Facebook className="h-4 w-4 mr-2" />
    Facebook
  </Button>
);

export const InstagramButton = ({ className = "" }: { className?: string }) => (
  <Button
    variant="outline"
    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 text-white hover:text-white"
    onClick={() =>
      window.open(
        "https://www.instagram.com/tanish_physio_fitness_clinic",
        "_blank"
      )
    }
  >
    <Instagram className="h-4 w-4 mr-2" />
    Instagram
  </Button>
);

export const YouTubeButton = ({ className = "" }: { className?: string }) => (
  <Button
    variant="outline"
    className="bg-red-600 hover:bg-red-700 border-0 text-white hover:text-white"
    onClick={() =>
      window.open(
        "https://www.youtube.com/@tanishphysiofitnessclinic3230",
        "_blank"
      )
    }
  >
    <Youtube className="h-4 w-4 mr-2" />
    YouTube
  </Button>
);

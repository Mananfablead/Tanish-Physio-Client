import { useState } from "react";
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface SocialShareButtonsProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  className?: string;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}

export const SocialShareButtons = ({
  title = "Check out this amazing physiotherapy service!",
  description = "Professional online physiotherapy services with certified therapists",
  url,
  image,
  className = "",
  showLabels = false,
  size = "md",
}: SocialShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = url || window.location.href;
  const shareImage = image || `${window.location.origin}/favicon.png`;

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

  // Social sharing URLs
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      currentUrl
    )}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(
      currentUrl
    )}&hashtags=physiotherapy,health,wellness`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      currentUrl
    )}`,
    email: `mailto:?subject=${encodeURIComponent(
      title
    )}&body=${encodeURIComponent(description + "\n\n" + currentUrl)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const openShareWindow = (url: string, width = 600, height = 400) => {
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    window.open(
      url,
      "share",
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,resizable=yes,scrollbars=yes`
    );
  };

  const shareButtons = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: shareUrls.facebook,
      action: () => openShareWindow(shareUrls.facebook, 600, 400),
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      url: shareUrls.twitter,
      action: () => openShareWindow(shareUrls.twitter, 600, 300),
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      url: shareUrls.linkedin,
      action: () => openShareWindow(shareUrls.linkedin, 600, 400),
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
      url: shareUrls.email,
      action: () => (window.location.href = shareUrls.email),
    },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {shareButtons.map((button) => {
        const Icon = button.icon;
        return (
          <Button
            key={button.name}
            variant="outline"
            size={size === "sm" ? "sm" : "default"}
            className={`${button.color} border-0 text-white hover:text-white transition-all duration-200 transform hover:scale-105`}
            onClick={button.action}
            title={`Share on ${button.name}`}
          >
            <Icon size={iconSize[size]} />
            {showLabels && (
              <span className="ml-2 hidden sm:inline">{button.name}</span>
            )}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size={size === "sm" ? "sm" : "default"}
        className="bg-green-600 hover:bg-green-700 border-0 text-white hover:text-white transition-all duration-200 transform hover:scale-105"
        onClick={handleCopyLink}
        title="Copy link"
      >
        {copied ? (
          <Check size={iconSize[size]} />
        ) : (
          <Copy size={iconSize[size]} />
        )}
        {showLabels && (
          <span className="ml-2 hidden sm:inline">
            {copied ? "Copied!" : "Copy Link"}
          </span>
        )}
      </Button>
    </div>
  );
};

export const SharePopover = ({
  title,
  description,
  url,
  image,
  triggerText = "Share",
  triggerVariant = "outline",
}: SocialShareButtonsProps & {
  triggerText?: string;
  triggerVariant?: "outline" | "default" | "secondary" | "ghost" | "link";
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={triggerVariant} className="gap-2">
          <Share2 className="h-4 w-4" />
          {triggerText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Share this page</h4>
          <SocialShareButtons
            title={title}
            description={description}
            url={url}
            image={image}
            showLabels={true}
            size="sm"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

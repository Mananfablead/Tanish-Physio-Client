import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import Autoplay from "embla-carousel-autoplay";
import { getIconComponent } from "./utils";
import { useState } from "react";
import { 
  ClipboardList,
  UserCheck,
  Video,
  Star,
  Shield,
  Award,
  CheckCircle,
  Users,
  Clock,
  Activity,
  HeartPulse,
  Stethoscope,
  Bone,
  Dumbbell,
  Zap,
  Quote,
  HelpCircle,
  Lock,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Calendar,
  Check,
  FileText,
  User,
  Phone,
  Mail,
  Home,
  Briefcase,
  GraduationCap,
  Heart,
  Eye,
  Settings,
  Search,
  Filter,
  Grid,
  List,
  Map,
  Navigation,
  Package,
  ShoppingCart,
  Tag,
  Truck,
  Wrench,
  Plus,
  Minus,
} from "lucide-react";

interface ConditionsWeTreatProps {
  cmsConditions: any;
  fadeInUp?: any;
  getIconComponent?: (iconName: string) => any;
}

/* ---------------------------------- */
/* Icon / Image fallback component */
/* ---------------------------------- */
const ConditionalIconRenderer = ({
  imageUrl,
  iconName = "Activity",
  altText,
}: {
  imageUrl?: string;
  iconName?: string;
  altText?: string;
}) => {
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    const IconComponent = getIconComponent(iconName);
    return <IconComponent className="h-8 w-8" />;
  }

  return (
    <img
      src={imageUrl}
      alt={altText}
      className="h-8 w-8 object-contain"
      onError={() => setHasError(true)}
    />
  );
};

export const ConditionsWeTreat = ({ cmsConditions }: ConditionsWeTreatProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };
  
  const getIconComponentFn = getIconComponent || ((iconName: string) => {
    const iconMap: Record<string, any> = {
      ClipboardList: ClipboardList,
      UserCheck: UserCheck,
      Video: Video,
      Star: Star,
      Shield: Shield,
      Award: Award,
      CheckCircle: CheckCircle,
      Users: Users,
      Clock: Clock,
      Activity: Activity,
      HeartPulse: HeartPulse,
      Stethoscope: Stethoscope,
      Bone: Bone,
      Dumbbell: Dumbbell,
      Zap: Zap,
      Quote: Quote,
      HelpCircle: HelpCircle,
      Lock: Lock,
      ShieldCheck: ShieldCheck,
      AlertCircle: AlertCircle,
      MapPin: MapPin,
      Calendar: Calendar,
      Check: Check,
      FileText: FileText,
      User: User,
      Phone: Phone,
      Mail: Mail,
      Home: Home,
      Briefcase: Briefcase,
      GraduationCap: GraduationCap,
      Heart: Heart,
      Eye: Eye,
      Settings: Settings,
      Search: Search,
      Filter: Filter,
      Grid: Grid,
      List: List,
      Map: Map,
      Navigation: Navigation,
      Package: Package,
      ShoppingCart: ShoppingCart,
      Tag: Tag,
      Truck: Truck,
      Wrench: Wrench,
      Plus: Plus,
      Minus: Minus,
    };
    
    return iconMap[iconName] || ClipboardList;
  });

  return (
    <section className="py-16 relative overflow-hidden border-y border-primary/10">
      {/* Background Blur */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10">
        {/* Heading */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="secondary" className="mb-4 border border-primary/20">
            {cmsConditions?.title || "Specialties"}
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {cmsConditions?.title || "Conditions We Treat"}
          </h2>
          <p className="text-muted-foreground">
            {cmsConditions?.description ||
              "Our experts specialize in a wide range of physical conditions to help you get back to your best self."}
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="px-12">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 3000 })]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {(cmsConditions?.conditions && cmsConditions.conditions.length > 0 ? cmsConditions.conditions : [
                { name: "Neck Pain", image: "", icon: "Activity" },
                { name: "Back Pain", image: "", icon: "Bone" },
                { name: "Knee Pain", image: "", icon: "HeartPulse" },
                { name: "Shoulder Pain", image: "", icon: "Zap" },
                { name: "Sports Injury", image: "", icon: "Dumbbell" },
                { name: "Post-Surgery", image: "", icon: "Stethoscope" },
                { name: "Sciatica", image: "", icon: "Activity" },
                { name: "Arthritis", image: "", icon: "Bone" },
                { name: "Spinal Cord", image: "", icon: "Activity" },
                { name: "Hip Pain", image: "", icon: "Zap" },
                { name: "Muscle Strain", image: "", icon: "Activity" },
                { name: "Ligament Tear", image: "", icon: "HeartPulse" }
              ]).map((condition: any, index: number) => {
                const item = {
                  label: condition.name,
                  image: condition.image,
                  color: ["primary", "accent", "success", "warning"][index % 4],
                  borderColor: "hover:border-primary",
                  bgColor: "bg-primary/10",
                  hoverBg: "group-hover:bg-primary",
                  activeLine: "bg-primary"
                };
                
                return (
                  <CarouselItem key={condition._id || index} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/6">
                    <motion.div 
                      variants={fadeInUp}
                      whileHover={{ y: -8 }}
                      className="group cursor-pointer py-2"
                    >
                      <div className={`bg-background rounded-2xl p-8 text-center shadow-soft border-2 border-transparent transition-all duration-500 group-hover:shadow-xl ${item.borderColor}`}>
                        <div className={`h-16 w-16 rounded-2xl ${item.bgColor} flex items-center justify-center mx-auto mb-6 ${item.hoverBg} group-hover:text-white transition-all duration-500 shadow-sm`}>
                          {item.image ? (
                            <ConditionalIconRenderer 
                              imageUrl={item.image} 
                              iconName={condition.icon || "Activity"} 
                              altText={item.label} 
                            />
                          ) : (
                            <div className="h-8 w-8">
                              <>{(() => {
                                const IconComponent = getIconComponent(condition.icon || "Activity");
                                return <IconComponent className="h-8 w-8" />;
                              })()}</>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <span className="font-bold text-sm tracking-wide">
                          {condition.title}
                        </span>

                        {/* Hover Line */}
                        <div className="mt-4 h-1 w-0 bg-primary mx-auto rounded-full group-hover:w-12 transition-all duration-500" />
                      </div>
                    </motion.div>
                  </CarouselItem>
                )
              )}
            </CarouselContent>

            <CarouselPrevious className="-left-12 border-primary/20 text-primary hover:bg-primary hover:text-white" />
            <CarouselNext className="-right-12 border-primary/20 text-primary hover:bg-primary hover:text-white" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

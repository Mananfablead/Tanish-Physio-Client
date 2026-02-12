import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  ArrowRight,
  X,
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

export const ConditionsWeTreat = ({ cmsConditions, fadeInUp, getIconComponent }: ConditionsWeTreatProps) => {
  const [selectedCondition, setSelectedCondition] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use passed props or fallback to local definitions
  const fadeInUpAnimation = fadeInUp || {
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
  
  const handleConditionClick = (condition: any) => {
    setSelectedCondition(condition);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCondition(null);
  };

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
        <div className="md:px-12">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 3000 })]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {cmsConditions?.conditions?.map(
                (condition: any, index: number) => (
                  <CarouselItem
                    key={condition._id || index}
                    className="pl-4 basis-full md:basis-1/2 lg:basis-1/6"
                  >
                    <motion.div
                      variants={fadeInUp}
                      whileHover={{ y: -8 }}
                      className="group cursor-pointer py-2"
                      onClick={() => handleConditionClick(condition)}
                    >
                      <div className="bg-background rounded-2xl p-6 sm:p-8 text-center shadow-soft border-2 border-transparent transition-all duration-500 hover:border-primary hover:shadow-xl">
                        {/* Icon / Image */}
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                          <ConditionalIconRenderer
                            imageUrl={condition.image}
                            altText={condition.title}
                          />
                        </div>

                        {/* Title */}
                        <span className="font-bold text-base sm:text-sm tracking-wide">
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

            <CarouselPrevious className="hidden md:flex -left-12 border-primary/20 text-primary hover:bg-primary hover:text-white" />
            <CarouselNext className="hidden md:flex -right-12 border-primary/20 text-primary hover:bg-primary hover:text-white" />
          </Carousel>
        </div>
      </div>
      
      {/* Condition Detail Modal */}
 {/* Condition Detail Modal */}
<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent className="
    w-[95vw]
    max-w-2xl
    max-h-[85vh]
    overflow-hidden
    mx-auto
    p-0
    rounded-2xl
    border-border/50
    bg-background/95
    backdrop-blur-xl
    shadow-2xl
    flex
    flex-col
  ">
    
    {/* HEADER */}
    <DialogHeader className="border-b border-border/30 px-4 sm:px-6 py-4">
      <div className="flex justify-between items-center">
        <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {selectedCondition?.title}
        </DialogTitle>

        {/* <Button
          variant="ghost"
          size="icon"
          onClick={closeModal}
          className="h-8 w-8 flex-shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          
        </Button> */}
      </div>
    </DialogHeader>

    {/* SCROLLABLE BODY */}
    <div className="overflow-y-auto px-4 sm:px-6 py-4">
      <div className="space-y-6">
        
        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Image */}
          {selectedCondition?.image && (
            <div className="flex-shrink-0 md:sticky md:top-4">
              <div className="h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-40 lg:w-40 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden shadow-lg border border-primary/10 mx-auto md:mx-0">
                <img
                  src={selectedCondition.image}
                  alt={selectedCondition.title}
                  className="h-full w-full object-contain p-3 sm:p-4 transition-transform hover:scale-105 duration-300"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {selectedCondition?.content && (
              <div className="prose max-w-none">
                <div className="
                  bg-muted/30
                  rounded-xl
                  p-4 sm:p-5
                  border border-border/20
                  shadow-sm
                  max-h-[45vh]
                  overflow-y-auto
                ">
                  <p className="
                    text-foreground
                    text-base sm:text-lg
                    leading-relaxed
                    break-words
                    whitespace-pre-wrap
                  ">
                    {selectedCondition.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-center pt-2">
          <Button 
            size="lg" 
            className="rounded-full px-8 sm:px-12 py-4 text-base sm:text-lg group w-full sm:w-auto h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => {
              closeModal();
              console.log("Book consultation clicked for:", selectedCondition?.title);
            }}
          >
            <span className="flex items-center font-semibold">
              Book Consultation
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        </div>

      </div>
    </div>

  </DialogContent>
</Dialog>

    </section>
  );
};

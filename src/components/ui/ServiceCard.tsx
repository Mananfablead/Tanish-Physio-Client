import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  details: ServiceDetails;
  ctaText?: string;
  serviceId?: number;
}

interface ServiceDetails {
  title: string;
  description: string;
  benefits: string[];
  detailedDescription: string;
  conditionsTreated: string[];
  sessionDuration: string;
  priceRange: string;
  prerequisites: string;
  whatToExpect: string[];
  resultsTimeline: string;
}

export function ServiceCard({ 
  icon, 
  title, 
  description, 
  benefits, 
  details,
  ctaText = "Learn More",
  serviceId
}: ServiceCardProps) {
  return (
    <>
      <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">{title}</h3>
          </div>
        </div>
        
        <p className="text-slate-600 mb-4 flex-grow">{description}</p>
        
        <div className="space-y-2 mb-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-slate-600">{benefit}</span>
            </div>
          ))}
        </div>
        
        <Link to={`/service/${serviceId}`}>
          <Button variant="outline" className="mt-auto w-full rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-bold">
            {ctaText}
          </Button>
        </Link>
      </Card>
    </>
  );
}
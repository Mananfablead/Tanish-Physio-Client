import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  details: ServiceDetails;
  ctaText?: string;
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
  ctaText = "Learn More" 
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
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-auto w-full rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-bold">
              {ctaText}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">
            <div className="p-6">
              <DialogHeader className="mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black text-slate-900">{details.title}</DialogTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border-primary/20">
                        {details.sessionDuration}
                      </Badge>
                      <Badge variant="secondary" className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border-primary/20">
                        {details.priceRange}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DialogDescription className="sr-only">
                  Detailed information about {details.title}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-3">About This Service</h3>
                    <p className="text-slate-600">{details.detailedDescription}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-3">Conditions We Treat</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {details.conditionsTreated.map((condition, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-slate-600">{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-3">What to Expect</h3>
                    <ul className="space-y-2">
                      {details.whatToExpect.map((expectation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-slate-600">{expectation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Service Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Session Duration</p>
                        <p className="font-bold text-slate-900">{details.sessionDuration}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Price Range</p>
                        <p className="font-bold text-slate-900">{details.priceRange}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Results Timeline</p>
                        <p className="font-bold text-slate-900">{details.resultsTimeline}</p>
                      </div>
                      {details.prerequisites && (
                        <div>
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Prerequisites</p>
                          <p className="font-bold text-slate-900">{details.prerequisites}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Ready to Get Started?</h3>
                    <p className="text-slate-600 text-sm mb-4">Schedule a session with one of our specialized therapists.</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 font-black">
                          Schedule Session
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">
                        <div className="p-6">
                          <DialogHeader className="mb-6">
                            <DialogTitle className="text-2xl font-black text-slate-900">
                              Schedule {details.title} Session
                            </DialogTitle>
                            <DialogDescription>
                              Complete the form below to schedule your {details.title.toLowerCase()} session
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" placeholder="Enter your first name" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" placeholder="Enter your last name" />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" placeholder="Enter your email" />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input id="phone" type="tel" placeholder="Enter your phone number" />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="preferredDate">Preferred Date</Label>
                                <Input id="preferredDate" type="date" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="preferredTime">Preferred Time</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a time" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="morning">Morning (9:00 AM - 12:00 PM)</SelectItem>
                                    <SelectItem value="afternoon">Afternoon (1:00 PM - 5:00 PM)</SelectItem>
                                    <SelectItem value="evening">Evening (5:00 PM - 8:00 PM)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="sessionDuration">Session Duration</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="30min">30 minutes</SelectItem>
                                  <SelectItem value="45min">45 minutes</SelectItem>
                                  <SelectItem value="60min">60 minutes</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="message">Additional Information</Label>
                              <Textarea 
                                id="message" 
                                placeholder="Any specific requirements or information for the therapist"
                                className="min-h-[100px]"
                              />
                            </div>
                            
                            <div className="pt-4">
                              <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 font-black">
                                Confirm Booking
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
}
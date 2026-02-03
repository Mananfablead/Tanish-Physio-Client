import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, User, Mail, Phone, MapPin } from "lucide-react";

interface PersonalInfoSectionProps {
  user: any;
  onSaveChanges: () => void;
}

export function PersonalInfoSection({ user, onSaveChanges }: PersonalInfoSectionProps) {
  return (
    <div className="space-y-8">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-1 h-14 p-1.5 bg-slate-200/50 backdrop-blur-md rounded-2xl mb-8 border border-slate-200 shadow-sm">
          <TabsTrigger
            value="personal"
            className="rounded-xl font-black text-sm transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md"
          >
            Personal Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Personal Details
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="name"
                      defaultValue={user?.name ?? "User"}
                      className="h-12 pl-10 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 font-bold"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      defaultValue={user?.email}
                      disabled
                      className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-500"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="phone"
                      defaultValue={user?.phone ?? ""}
                      className="h-12 pl-10 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 font-bold"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="location"
                      defaultValue={user?.location ?? ""}
                    
                      placeholder="Enter your location"
                      className="h-12 pl-10 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end items-center gap-3 pt-6 border-t border-slate-50 mt-auto">
              <Button
                className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-black transition-all"
                onClick={onSaveChanges}
              >
                <Save className="h-5 w-5 mr-2" /> Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
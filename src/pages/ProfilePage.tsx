import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Clock,
  Camera,
  Save,
  FileText,
  Star,
  Users,
  Calendar,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="relative overflow-hidden border-b-2 border-primary/10" style={{ backgroundColor: '#f1fafa' }}>
        {/* Decorative Blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        </div>

        <div className="container relative py-8 z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-accent rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500" />
              <Avatar className="h-32 w-32 border-4 border-white shadow-2xl relative">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" className="absolute bottom-1 right-1 h-10 w-10 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-white border-2 border-white">
                <Camera className="h-5 w-5" />
              </Button>
            </div>
            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{user?.name}</h1>
                <Badge variant="secondary" className="capitalize px-4 py-1 text-sm border border-primary/20 shadow-sm">
                  Patient
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-600 font-medium">
                <p className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="h-4 w-4 text-primary" /> {user?.email}
                </p>
                <p className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 text-primary" /> +1 (555) 000-0000
                </p>
              </div>
            </div>

            {/* Top Right Stats Section */}
            <div className="flex-1" />
            <div className="hidden lg:flex items-center gap-4">
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-primary/10 shadow-sm flex items-center gap-4 hover:bg-white transition-all group">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 leading-none">3</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Active Plans</p>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-primary/10 shadow-sm flex items-center gap-4 hover:bg-white transition-all group">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 leading-none">12</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Completed</p>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-primary/10 shadow-sm flex items-center gap-4 hover:bg-white transition-all group">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 leading-none">2</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Upcoming</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg font-bold">Account Verification</CardTitle>
                <CardDescription className="font-medium">Status of your patient profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-4 p-4 bg-success/5 rounded-2xl border border-success/20 group hover:bg-success/10 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">Email Verified</p>
                    <p className="text-xs font-semibold text-success/80">Verified on Dec 20, 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-accent shadow-lg overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg font-bold">Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <Phone className="h-5 w-5 text-slate-400 group-hover:text-accent transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">+1 (555) 000-0000</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <MapPin className="h-5 w-5 text-slate-400 group-hover:text-accent transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">San Francisco, CA</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1.5 bg-slate-100/80 rounded-2xl mb-8">
                <TabsTrigger value="personal" className="rounded-xl font-bold py-3 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Personal Info</TabsTrigger>
                <TabsTrigger value="medical" className="rounded-xl font-bold py-3 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Medical History</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <Card className="shadow-lg border-primary/5">
                  <CardHeader className="border-b border-slate-50">
                    <CardTitle className="text-2xl font-bold text-slate-900">Personal Details</CardTitle>
                    <CardDescription className="text-slate-500 font-medium text-base">Update your basic contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <Label htmlFor="full-name" className="text-sm font-bold text-slate-700">Full Name</Label>
                        <Input id="full-name" defaultValue={user?.name} className="h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address</Label>
                        <Input id="email" defaultValue={user?.email} disabled className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="phone" className="text-sm font-bold text-slate-700">Phone Number</Label>
                        <Input id="phone" placeholder="+1 (555) 000-0000" className="h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="location" className="text-sm font-bold text-slate-700">Location</Label>
                        <Input id="location" placeholder="City, Country" className="h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" />
                      </div>
                    </div>
                    <div className="pt-6 flex justify-end">
                      <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold transition-all">
                        <Save className="h-5 w-5 mr-2" /> Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6">
                <Card className="shadow-lg border-primary/5">
                  <CardHeader className="border-b border-slate-50">
                    <CardTitle className="text-2xl font-bold text-slate-900">Medical Context</CardTitle>
                    <CardDescription className="text-slate-500 font-medium text-base">Help therapists understand your background</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-8">
                    <div className="space-y-2.5">
                      <Label htmlFor="history" className="text-sm font-bold text-slate-700">Previous Injuries or Conditions</Label>
                      <Textarea 
                        id="history" 
                        placeholder="List any past surgeries, injuries, or chronic conditions..." 
                        className="min-h-[150px] rounded-2xl border-slate-200 focus:border-primary focus:ring-primary/20 p-4"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="goals" className="text-sm font-bold text-slate-700">Recovery Goals</Label>
                      <Input id="goals" placeholder="e.g. Return to running, Reduce lower back pain" className="h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" />
                    </div>
                    <div className="pt-6 flex justify-end">
                      <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold">
                        <Save className="h-5 w-5 mr-2" /> Update Medical Info
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}

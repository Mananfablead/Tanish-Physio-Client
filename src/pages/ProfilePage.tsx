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
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user } = useAuth();
  const isTherapist = user?.role === 'therapist';

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback className="text-2xl font-bold bg-green-100 text-green-700">
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" variant="secondary" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-bold text-slate-900">{user?.name}</h1>
                <Badge variant={isTherapist ? "success" : "secondary"} className="capitalize">
                  {user?.role || 'Patient'}
                </Badge>
              </div>
              <p className="text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-4 w-4" /> {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Verification</CardTitle>
                <CardDescription>Status of your clinical profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-bold text-green-900">Email Verified</p>
                    <p className="text-[10px] text-green-700">Verified on Dec 20, 2024</p>
                  </div>
                </div>
                {isTherapist && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <Award className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-bold text-blue-900">Medical License</p>
                      <p className="text-[10px] text-blue-700">Pending secondary review</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">+1 (555) 000-0000</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">San Francisco, CA</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="clinical">{isTherapist ? "Clinical Practice" : "Medical History"}</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Details</CardTitle>
                    <CardDescription>Update your basic contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input id="full-name" defaultValue={user?.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" defaultValue={user?.email} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="+1 (555) 000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="City, Country" />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="clinical" className="space-y-6">
                {isTherapist ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Professional Biography</CardTitle>
                        <CardDescription>Tell patients about your expertise and clinical approach</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea 
                            id="bio" 
                            placeholder="Write a short biography about your professional experience..." 
                            className="min-h-[150px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialties">Specialties (Comma separated)</Label>
                          <Input id="specialties" placeholder="Sports Medicine, Orthopedics, Post-Op Recovery" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Clinical Information</CardTitle>
                        <CardDescription>Details required for healthcare professional verification</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="license">License Number</Label>
                            <Input id="license" placeholder="e.g. PT-123456789" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="experience">Years of Experience</Label>
                            <Input id="experience" type="number" placeholder="e.g. 10" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="education">Highest Degree</Label>
                            <Input id="education" placeholder="e.g. Doctor of Physical Therapy" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="languages">Languages Spoken</Label>
                            <Input id="languages" placeholder="e.g. English, Spanish" />
                          </div>
                        </div>
                        <div className="pt-4 flex gap-3">
                          <Button className="bg-green-600 hover:bg-green-700">
                            <Save className="h-4 w-4 mr-2" /> Save Clinical Profile
                          </Button>
                          <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" /> Upload Certifications
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Medical Context</CardTitle>
                      <CardDescription>Help therapists understand your background</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="history">Previous Injuries or Conditions</Label>
                        <Textarea 
                          id="history" 
                          placeholder="List any past surgeries, injuries, or chronic conditions..." 
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goals">Recovery Goals</Label>
                        <Input id="goals" placeholder="e.g. Return to running, Reduce lower back pain" />
                      </div>
                      <div className="pt-4">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Save className="h-4 w-4 mr-2" /> Update Medical Info
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}

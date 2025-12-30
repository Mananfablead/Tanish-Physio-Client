import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Video, Clock, Play, FileText, MessageSquare, Settings, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTherapist = user?.role === 'therapist';

  return (
    <Layout>
      <div className="bg-muted/30 py-8">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-muted-foreground">
            {isTherapist 
              ? "Manage your patients, sessions, and clinical records." 
              : "Manage your sessions and track your recovery progress."}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Role Specific Status Card */}
        <Card variant={isTherapist ? "outline" : "featured"} className="mb-8">
          <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge variant="success" className="mb-2">
                {isTherapist ? "Online" : "Active"}
              </Badge>
              <h3 className="font-semibold text-lg">
                {isTherapist ? "Clinical Practice Portal" : "Monthly Plan"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isTherapist ? "All systems operational" : "Renews on Jan 30, 2025"}
              </p>
            </div>
            <Link to={isTherapist ? "/profile" : "/plans"}>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                {isTherapist ? "Clinical Settings" : "Manage Subscription"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Sessions</TabsTrigger>
            <TabsTrigger value={isTherapist ? "patients" : "exercises"}>
              {isTherapist ? "My Patients" : "Exercise Plans"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card variant="interactive" className="mb-4">
              <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={isTherapist ? "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=60&h=60&fit=crop&crop=face" : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face"} 
                    alt="User avatar" 
                    className="w-14 h-14 rounded-xl object-cover" 
                  />
                  <div>
                    <p className="font-semibold">
                      {isTherapist ? "Patient: Michael Chen" : "Dr. Sarah Johnson"}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Mon, Dec 30 at 10:00 AM
                    </p>
                  </div>
                </div>
                <Button variant="hero" onClick={() => navigate('/video-call')}><Video className="h-4 w-4 mr-2" />Join Session</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card variant="outline" className="mb-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {isTherapist ? "Consultation: Emma Wilson" : "Session with Dr. Sarah Johnson"}
                    </p>
                    <p className="text-sm text-muted-foreground">Dec 23, 2024 • 45 min</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm"><Play className="h-4 w-4 mr-1" />Recording</Button>
                    <Button variant="ghost" size="sm"><FileText className="h-4 w-4 mr-1" />Notes</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={isTherapist ? "patients" : "exercises"}>
            <Card variant="gradient">
              <CardContent className="p-6 text-center">
                {isTherapist ? (
                  <>
                    <p className="text-muted-foreground">Manage your patient roster and their individual recovery progress.</p>
                    <Button variant="hero" className="mt-4"><Users className="h-4 w-4 mr-2" />View Patient Roster</Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground">Your personalized exercise plans will appear here after your first session.</p>
                    <Link to="/therapists"><Button variant="hero" className="mt-4">Book Your First Session</Button></Link>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

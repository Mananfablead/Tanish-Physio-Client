import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Video, Clock, Play, FileText, MessageSquare, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="bg-muted/30 py-8">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
          <p className="text-muted-foreground">Manage your sessions and track your recovery progress.</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Subscription Status */}
        <Card variant="featured" className="mb-8">
          <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge variant="success" className="mb-2">Active</Badge>
              <h3 className="font-semibold text-lg">Monthly Plan</h3>
              <p className="text-sm text-muted-foreground">Renews on Jan 30, 2025</p>
            </div>
            <Link to="/plans">
              <Button variant="outline"><Settings className="h-4 w-4 mr-2" />Manage Subscription</Button>
            </Link>
          </CardContent>
        </Card>

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Sessions</TabsTrigger>
            <TabsTrigger value="exercises">Exercise Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card variant="interactive" className="mb-4">
              <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face" alt="Dr. Sarah Johnson" className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <p className="font-semibold">Dr. Sarah Johnson</p>
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
                    <p className="font-medium">Session with Dr. Sarah Johnson</p>
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

          <TabsContent value="exercises">
            <Card variant="gradient">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Your personalized exercise plans will appear here after your first session.</p>
                <Link to="/therapists"><Button variant="hero" className="mt-4">Book Your First Session</Button></Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

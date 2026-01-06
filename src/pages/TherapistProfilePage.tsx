import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Clock,
  Calendar,
  Video,
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Users,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";

const therapistData = {
  id: 1,
  name: "Dr. Sarah Johnson",
  title: "Sports Injury Specialist",
  bio: "Dr. Sarah Johnson is a certified physiotherapist with over 12 years of experience specializing in sports injuries and rehabilitation. She has worked with professional athletes and weekend warriors alike, helping them recover from injuries and improve their performance. Her approach combines evidence-based techniques with personalized care plans.",
  avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
  experience: 12,
  rating: 4.9,
  reviews: 156,
  languages: ["English", "Spanish"],
  certifications: [
    "Doctor of Physical Therapy (DPT)",
    "Board Certified Sports Clinical Specialist",
    "Certified Strength and Conditioning Specialist",
    "Dry Needling Certified",
  ],
  expertise: [
    "Knee Rehabilitation",
    "ACL Recovery",
    "Sports Performance",
    "Running Injuries",
    "Shoulder Rehabilitation",
    "Post-surgical Care",
  ],
  sessionFormats: [
    { type: "1-on-1", duration: "45 min", description: "Private video consultation" },
    // { type: "1-on-1", duration: "60 min", description: "Extended private session" },
    { type: "Group", duration: "60 min", description: "Small group session (max 6)" },
  ],
  sampleVideos: [
    { title: "Knee Strengthening Exercises", duration: "5:30" },
    { title: "ACL Recovery Week 1-4", duration: "8:15" },
    { title: "Runner's Warm-up Routine", duration: "4:45" },
  ],
  reviewsList: [
    {
      id: 1,
      name: "John D.",
      rating: 5,
      date: "2 weeks ago",
      comment: "Dr. Johnson helped me recover from a knee injury in record time. Her exercises were clear and effective.",
    },
    {
      id: 2,
      name: "Maria S.",
      rating: 5,
      date: "1 month ago",
      comment: "Very professional and knowledgeable. The video sessions were just as effective as in-person visits.",
    },
    {
      id: 3,
      name: "David K.",
      rating: 4,
      date: "1 month ago",
      comment: "Great experience overall. Would recommend to anyone dealing with sports injuries.",
    },
  ],
};




export default function TherapistProfilePage() {


  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-muted/30 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <img
                src={therapistData.avatar}
                alt={therapistData.name}
                className="w-40 h-40 rounded-2xl object-cover shadow-medium"
              />
            </motion.div>

            <motion.div
              className="flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{therapistData.name}</h1>
                  <p className="text-lg text-muted-foreground">
                    {therapistData.title}
                  </p>
                </div>
                <Badge variant="success" className="text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  Available Today
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-warning text-warning" />
                  <span className="font-semibold">{therapistData.rating}</span>
                  <span className="text-muted-foreground">
                    ({therapistData.reviews} reviews)
                  </span>
                </div>
                <div className="text-muted-foreground">
                  {therapistData.experience} years experience
                </div>
                <div className="text-muted-foreground">
                  {therapistData.languages.join(", ")}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {therapistData.expertise.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-4 space-y-8">
            <Tabs defaultValue="about">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="about"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="videos"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Sample Videos
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="pt-6 space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Biography</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {therapistData.bio}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Certifications</h3>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {therapistData.certifications.map((cert) => (
                      <li key={cert} className="flex items-start gap-2">
                        <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="videos" className="pt-6">
                <div className="grid md:grid-cols-4 gap-4">
                  {therapistData.sampleVideos.map((video, index) => (
                    <Card
                      key={index}
                      variant="interactive"
                      className="group cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                          <div className="h-14 w-14 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-6 w-6 text-primary-foreground ml-1" />
                          </div>
                        </div>
                        <h4 className="font-medium">{video.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {video.duration}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="pt-6 space-y-4">
                {therapistData.reviewsList.map((review) => (
                  <Card key={review.id} variant="outline">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{review.name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating
                                  ? "fill-warning text-warning"
                                  : "text-muted"
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {review.date}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>


        </div>
      </div>
    </Layout>
  );
}

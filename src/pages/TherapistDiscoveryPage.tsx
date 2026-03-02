import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEO/SEOHead";
import { getSEOConfig } from "@/components/SEO/seoConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Star, Search, Filter, MapPin, Clock, Users, Video } from "lucide-react";
import { motion } from "framer-motion";

const therapists = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialization: "Sports Injury Specialist",
    experience: 12,
    rating: 4.9,
    reviews: 156,
    price: 80,
    sessions: ["1-on-1", "Group"],
    languages: ["English", "Gujarati"],
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    availability: "Available Today",
    tags: ["Knee Rehab", "ACL Recovery", "Athletes"],
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialization: "Spine & Posture Expert",
    experience: 15,
    rating: 4.8,
    reviews: 203,
    price: 95,
    sessions: ["1-on-1"],
    languages: ["English", "Hindi"],
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    availability: "Next Available: Tomorrow",
    tags: ["Lower Back Pain", "Sciatica", "Posture Correction"],
  },
  {
    id: 3,
    name: "Dr. Emily Parker",
    specialization: "Post-Surgery Rehabilitation",
    experience: 8,
    rating: 4.9,
    reviews: 89,
    price: 75,
    sessions: ["1-on-1", "Group"],
    languages: ["English"],
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face",
    availability: "Available Today",
    tags: ["Hip Replacement", "Shoulder Surgery", "Recovery"],
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialization: "Chronic Pain Management",
    experience: 20,
    rating: 4.7,
    reviews: 312,
    price: 110,
    sessions: ["1-on-1"],
    languages: ["English", "Hindi", "Gujarati"],
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face",
    availability: "Available Today",
    tags: ["Fibromyalgia", "Arthritis", "Chronic Pain"],
  },
  {
    id: 5,
    name: "Dr. Lisa Rodriguez",
    specialization: "Pediatric Physiotherapy",
    experience: 10,
    rating: 5.0,
    reviews: 67,
    price: 85,
    sessions: ["1-on-1", "Group"],
    languages: ["English", "Spanish", "Portuguese"],
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
    availability: "Next Available: Wed",
    tags: ["Children", "Developmental", "Youth Sports"],
  },
  {
    id: 6,
    name: "Dr. Robert Kim",
    specialization: "Neurological Rehabilitation",
    experience: 14,
    rating: 4.8,
    reviews: 145,
    price: 100,
    sessions: ["1-on-1"],
    languages: ["English", "Korean"],
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
    availability: "Available Today",
    tags: ["Stroke Recovery", "MS", "Parkinson's"],
  },
];

export default function TherapistDiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionType, setSessionType] = useState("all");
  const [language, setLanguage] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredTherapists = therapists.filter((therapist) => {
    const matchesSearch = 
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSession = 
      sessionType === "all" || therapist.sessions.includes(sessionType);
    
    const matchesLanguage = 
      language === "all" || therapist.languages.includes(language);

    return matchesSearch && matchesSession && matchesLanguage;
  });

  return (
    <Layout>
      <SEOHead {...getSEOConfig("/therapists")} />
      <div className="bg-muted/30 py-8">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-2">
              Find Your Physiotherapist
            </h1>
            <p className="text-muted-foreground">
              Browse our certified therapists and find the perfect match for
              your recovery needs.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`lg:w-72 space-y-6 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <Card variant="outline" className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </h3>

              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Session Type</Label>
                  <Select value={sessionType} onValueChange={setSessionType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="1-on-1">1-on-1 Sessions</SelectItem>
                      <SelectItem value="Group">Group Sessions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Gujarati">Gujarati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSessionType("all");
                    setLanguage("all");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Mobile Filter Toggle */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialization, or condition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredTherapists.length} therapists
            </p>

            {/* Therapist Cards */}
            <div className="grid gap-6">
              {filteredTherapists.map((therapist, index) => (
                <motion.div
                  key={therapist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="interactive" className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <img
                            src={therapist.avatar}
                            alt={therapist.name}
                            className="w-24 h-24 rounded-xl object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {therapist.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {therapist.specialization}
                              </p>
                            </div>
                            <Badge
                              variant={
                                therapist.availability.includes("Today")
                                  ? "success"
                                  : "secondary"
                              }
                              className="flex-shrink-0"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {therapist.availability}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-warning text-warning" />
                              <span className="font-medium">
                                {therapist.rating}
                              </span>
                              <span className="text-muted-foreground">
                                ({therapist.reviews} reviews)
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              {therapist.experience} years experience
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {therapist.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="muted"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Video className="h-4 w-4" />
                              {therapist.sessions.join(" / ")}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {therapist.languages.join(", ")}
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col items-end justify-between md:text-right">
                          <Link to={`/therapist/${therapist.id}`}>
                            <Button variant="hero">View Profile</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredTherapists.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No therapists found matching your criteria.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setSessionType("all");
                    setLanguage("all");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

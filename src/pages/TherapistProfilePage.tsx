import { useState, useEffect } from "react";
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
  MessageSquare,
  FileText,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";

// Import Redux hooks and admin actions
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store';
import { fetchPublicAdmins } from '@/store/slices/adminSlice';


export default function TherapistProfilePage() {

  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  // Fetch public admins from Redux store
  const { admins: publicAdmins, loading: adminsLoading, error: adminsError } = useSelector((state: RootState) => state.admins);

  // Find the specific therapist based on the ID from the URL
  const therapist = publicAdmins.find(admin => admin.id === id) || null;

  // Fetch public admins when component mounts
  useEffect(() => {
    dispatch(fetchPublicAdmins());
  }, [dispatch]);

  // Parse languages - handle both array and JSON string formats
  const parseLanguages = (langs: any): string[] => {
    if (!langs) return ["English"];
    
    // If it's already an array
    if (Array.isArray(langs)) {
      return langs.map(lang => {
        // If language is a JSON string, parse it
        if (typeof lang === 'string' && lang.startsWith('[')) {
          try {
            return JSON.parse(lang);
          } catch {
            return lang;
          }
        }
        return lang;
      }).flat();
    }
    
    // If it's a single string
    if (typeof langs === 'string') {
      // Check if it's a JSON string
      if (langs.startsWith('[')) {
        try {
          return JSON.parse(langs);
        } catch {
          return [langs];
        }
      }
      return [langs];
    }
    
    return ["English"];
  };

  // Map the API data to match the expected structure
  const therapistData = therapist ? {
    id: therapist.id,
    name: therapist.name,
    title: therapist.doctorProfile?.specialization || "Certified Physiotherapist",
    bio: therapist.doctorProfile?.bio || "No biography available.",
    avatar: therapist.profilePicture || "/default-avatar.png",
    experience: parseInt(therapist.doctorProfile?.experience) || 0,
    rating: 0, // Will be calculated from reviews or set to 0
    reviews: 0, // Will be calculated from reviews or set to 0
    languages: parseLanguages(therapist.doctorProfile?.languages),
    certifications: therapist.doctorProfile?.certifications || [],
    expertise: therapist.doctorProfile?.specialization ? [therapist.doctorProfile.specialization] : [],
  } : null;

  if (adminsLoading && !therapist) {
    return (
      <Layout>
        <div className="container py-12 flex justify-center items-center">
          <p>Loading therapist profile...</p>
        </div>
      </Layout>
    );
  }

  if (adminsError && !therapist) {
    return (
      <Layout>
        <div className="container py-12 flex justify-center items-center">
          <p className="text-destructive">Error loading therapist profile: {adminsError}</p>
        </div>
      </Layout>
    );
  }

  if (!therapistData) {
    return (
      <Layout>
        <div className="container py-12 flex justify-center items-center">
          <p>Therapist not found.</p>
        </div>
      </Layout>
    );
  }

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
        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div className="space-y-8">
            <Tabs defaultValue="about">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="about"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  About
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
                  <div className="grid md:grid-cols-2 gap-4">
                    {therapistData.certifications.map((certUrl, index) => {
                      // Extract filename from URL
                      const filename = certUrl.split("/").pop() || `Certification ${index + 1}`;
                      // Clean filename by removing timestamp prefix
                      const cleanFilename = filename.replace(/^cert-\d+-\d+\./, "Certification.");
                      
                      return (
                        <div key={certUrl} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="bg-primary/10 rounded-lg p-2">
                                <Award className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <a 
                                href={certUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-primary hover:underline block mb-1"
                                title={filename}
                              >
                                {cleanFilename}
                              </a>
                              <p className="text-xs text-muted-foreground">
                                Click to view certificate
                              </p>
                            </div>
                          </div>
                          
                          {/* PDF Thumbnail Preview */}
                          <div className="mt-3 relative">
                            <div className="border rounded bg-muted/20 h-32 flex items-center justify-center overflow-hidden">
                              <div className="text-center p-2">
                                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-xs text-muted-foreground">PDF Document</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {Math.floor(Math.random() * 200 + 50)} KB
                                </p>
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-black/5 rounded flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Eye className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>


        </div>
      </div>
    </Layout>
  );
}

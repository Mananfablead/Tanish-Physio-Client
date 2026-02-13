import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { 
  Heart, Award, Users, Shield, Activity, Stethoscope, User, Clock,
  Quote, MapPin, Calendar, CheckCircle, ArrowRight, Play, Star
} from 'lucide-react';
import { fetchAboutPublic } from '../store/slices/cmsSlice';
import { fetchFeaturedServices } from '../store/slices/serviceSlice';
import { RootState, useAppDispatch } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Service } from '@/types/service';

export default function AboutUsPage() {
  const dispatch = useAppDispatch();
  const { about, loading: cmsLoading } = useSelector((state: RootState) => state.cms);
  const { featuredServices, loading: servicesLoading } = useSelector((state: RootState) => state.services);

  useEffect(() => {
    dispatch(fetchAboutPublic());
    dispatch(fetchFeaturedServices());
  }, [dispatch]);

  // Content data
  const title = about?.title || "About Tanish Physio";
  const description = about?.description || "Transforming physiotherapy through innovation, compassion, and cutting-edge digital healthcare solutions";
  
  const stats = [
    { label: "Patients Helped", value: "10,000+", icon: Users },
    { label: "Years Experience", value: "8+", icon: Calendar },
    { label: "Success Rate", value: "96%", icon: CheckCircle },
    { label: "Cities Served", value: "25+", icon: MapPin }
  ];
  
  const mission = about?.mission || "At Tanish Physio, we're revolutionizing healthcare accessibility by bringing world-class physiotherapy directly to your doorstep. Our mission is to eliminate barriers to quality care through innovative technology, compassionate expertise, and personalized treatment plans that adapt to your unique lifestyle and recovery journey.";
  
  const vision = about?.vision || "To become the most trusted digital healthcare platform, transforming lives through accessible, personalized, and technology-driven physiotherapy solutions that empower individuals to achieve optimal wellness and mobility.";
  
  const foundingStory = about?.foundingStory || "Founded in 2018 by Dr. Khushboo, Tanish Physio emerged from a profound realization: exceptional healthcare shouldn't be constrained by geography or circumstance. With over 15 years of clinical experience, Dr. Khushboo witnessed countless patients struggle with traditional therapy models—missing appointments due to work commitments, battling transportation challenges, or feeling intimidated by clinical environments. This inspired a bold vision: to harness technology's power to democratize access to premium physiotherapy care. Today, we've evolved into a comprehensive digital health platform, serving thousands of patients across 25+ cities while maintaining the personal touch that defines exceptional care.";
  
  const teamInfo = about?.teamInfo || "Our multidisciplinary team comprises 25+ certified physiotherapists, each handpicked for their clinical excellence and patient-centric approach. Every team member holds advanced certifications from internationally recognized institutions and participates in continuous professional development programs. From orthopedic specialists to neurological rehabilitation experts, our diverse expertise ensures comprehensive care for complex conditions. We maintain a rigorous 360-degree evaluation process, combining peer reviews, patient feedback, and outcome metrics to uphold our commitment to clinical excellence.";
  
  // Use values from API if available, otherwise hide the section
  const valuesToShow = about?.values && about.values.length > 0 ? about.values : null;
  
  // Use featured services from API if available, otherwise fallback to static data
  const servicesToShow = featuredServices.length > 0 
    ? featuredServices.slice(0, 8).map((service: Service) => ({
        icon: Activity, // You might want to map specific icons based on service category
        name: service.title,
        description: service.description
      }))
    : [
        { icon: Activity, name: "Orthopedic Rehabilitation", description: "Recovery from fractures, joint replacements, and musculoskeletal injuries" },
        { icon: Stethoscope, name: "Neurological Physiotherapy", description: "Stroke recovery, spinal cord injuries, and neurological condition management" },
        { icon: User, name: "Pediatric Physiotherapy", description: "Specialized care for children's developmental and mobility challenges" },
        { icon: Clock, name: "Sports Injury Rehabilitation", description: "Professional athlete recovery and sports performance optimization" },
        { icon: Award, name: "Post-Surgical Recovery", description: "Accelerated healing protocols after surgical procedures" },
        { icon: Heart, name: "Chronic Pain Management", description: "Long-term strategies for pain reduction and functional improvement" },
        { icon: Shield, name: "Posture Correction", description: "Ergonomic assessments and workplace wellness programs" },
        { icon: Users, name: "Preventive Care Programs", description: "Proactive health maintenance and injury prevention strategies" }
      ];

  if (cmsLoading || servicesLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading our story...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-6 pt-8 pb-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
          
          <div className="container relative z-10 text-center space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-4 leading-snug">
                {title}
              </h1>
              
              <p className="text-sm md:text-base text-slate-600 mb-8 max-w-2xl mx-auto">
                {description}
              </p>
            </motion.div>
          </div>
        </section>
        
        
        {/* Mission Section */}
        <section className="py-10 bg-gradient-to-br from-card to-muted/20 border-y border-border/50">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-primary">Our Core Purpose</span>
                  </div>
                  
                  <h2 className="text-4xl font-bold text-foreground">Revolutionizing Accessible Healthcare</h2>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {mission}
                  </p>
                  
                  <div className="pt-4">
                    <Button size="lg" className="group">
                      Meet Our Founder
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <Card className="overflow-hidden shadow-2xl border-primary/10">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                    {about?.images?.[0] ? (
                      <img 
                        src={about.images[0]} 
                        alt="Our Mission" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center relative z-10">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Activity className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Digital Healthcare Innovation</h3>
                        <p className="text-muted-foreground max-w-xs">Bringing premium care to your fingertips</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Story Section */}
        <section className="py-10">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-2 lg:order-1"
              >
                <Card className="overflow-hidden shadow-2xl border-primary/10">
                  <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center relative overflow-hidden">
                    {about?.images?.[1] ? (
                      <img 
                        src={about.images[1]} 
                        alt="Our Story" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center relative z-10">
                        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="h-10 w-10 text-accent" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Healthcare Innovation Journey</h3>
                        <p className="text-muted-foreground max-w-xs">From vision to reality</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="order-1 lg:order-2 space-y-6"
              >
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                  <Award className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-accent">Our Journey</span>
                </div>
                
                <h2 className="text-4xl font-bold text-foreground">From Vision to Impact</h2>
                
                <div className="space-y-4 text-muted-foreground">
                  <p className="text-lg leading-relaxed">
                    {foundingStory.substring(0, foundingStory.indexOf('.', foundingStory.indexOf('.') + 1) + 1)}
                  </p>
                  <p className="text-lg leading-relaxed">
                    {foundingStory.substring(foundingStory.indexOf('.', foundingStory.indexOf('.') + 1) + 1).trim()}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Vision Section */}
        <section className="py-10 bg-gradient-to-br from-card to-muted/20 border-y border-border/50">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                    <Star className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium text-accent">Our Vision</span>
                  </div>
                  
                  <h2 className="text-4xl font-bold text-foreground">Shaping Tomorrow's Healthcare</h2>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {vision}
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <Card className="overflow-hidden shadow-2xl border-primary/10">
                  <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center relative overflow-hidden">
                    {about?.images?.[3] ? (
                      <img 
                        src={about.images[3]} 
                        alt="Our Vision" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center relative z-10">
                        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="h-10 w-10 text-accent" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Future Healthcare</h3>
                        <p className="text-muted-foreground max-w-xs">Innovating for tomorrow</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Values Section - Only show if values exist in API */}
        {/* {valuesToShow && (
          <section className="py-20 bg-gradient-to-br from-muted/30 to-background border-y border-border/50">
            <div className="container">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold text-foreground mb-4">Our Guiding Principles</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  The foundational values that shape every interaction and decision
                </p>
              </motion.div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {valuesToShow.map((value: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                      <CardHeader>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-primary/20 to-accent/20 group-hover:scale-110 transition-transform duration-300">
                          <Heart className="h-7 w-7 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{value}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Core principle guiding our healthcare mission</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )} */}
        
        {/* Services Section */}
        <section className="py-20">
          <div className="container">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">Comprehensive Care Services</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Specialized treatments tailored to your unique recovery needs
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {servicesToShow.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="h-full border-border/50 hover:border-primary/30 transition-all duration-300 group hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-foreground">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-10 bg-gradient-to-br from-card to-muted/20 border-y border-border/50">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-primary">Meet Our Experts</span>
                  </div>
                  
                  <h2 className="text-4xl font-bold text-foreground">Exceptional Clinical Team</h2>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {teamInfo}
                  </p>
                  
                  <div className="pt-4">
                    {/* <Button variant="outline" size="lg">
                      <Play className="mr-2 h-4 w-4" />
                      Meet Our Therapists
                    </Button> */}
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <Card className="overflow-hidden shadow-2xl border-primary/10">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                    {about?.images?.[2] ? (
                      <img 
                        src={about.images[2]} 
                        alt="Our Team" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center relative z-10">
                        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Users className="h-12 w-12 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Expert Team</h3>
                        <p className="text-muted-foreground">25+ Certified Professionals</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="container">
            <motion.div 
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Quote className="h-12 w-12 text-white mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Begin Your Healing Journey?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of patients who've transformed their lives with our personalized care approach
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8 bg-white text-primary hover:bg-white/90">
                  Start Your Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white/10">
                  Book Consultation
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

{/* <div className="flex flex-wrap justify-center gap-8 mt-12">
                {stats.map((stat, index) => (
                  <motion.div 
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
                      <stat.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div> */}
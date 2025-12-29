import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, 
  UserCheck, 
  Video, 
  Star, 
  Shield, 
  Award,
  ArrowRight,
  CheckCircle,
  Users,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-physio.jpg";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-4">
                <Badge variant="secondary" className="px-4 py-1.5">
                  <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                  Trusted by 10,000+ patients
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-balance">
                  Start Your{" "}
                  <span className="text-primary">Recovery</span>{" "}
                  Journey Today
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">
                  Connect with certified physiotherapists from home. Get personalized treatment plans and video consultations tailored to your needs.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/questionnaire">
                  <Button variant="hero" size="xl">
                    Start Your Recovery
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </Button>
                </Link>
                <Link to="/therapists">
                  <Button variant="heroOutline" size="xl">
                    Continue as Guest
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Certified Therapists</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-large">
                <img 
                  src={heroImage} 
                  alt="Physiotherapist helping patient with recovery exercises"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
              
              {/* Floating Stats Card */}
              <Card variant="glass" className="absolute -bottom-6 -left-6 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">500+</p>
                    <p className="text-sm text-muted-foreground">Active Therapists</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" className="absolute -top-4 -right-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Three Simple Steps to Recovery
            </h2>
            <p className="text-muted-foreground">
              Our streamlined process ensures you get the right care from the right therapist.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: ClipboardList,
                step: "01",
                title: "Answer Health Questions",
                description: "Complete a quick assessment about your condition, pain areas, and recovery goals."
              },
              {
                icon: UserCheck,
                step: "02",
                title: "Choose a Physiotherapist",
                description: "Browse certified therapists matched to your needs. Review profiles, ratings, and specializations."
              },
              {
                icon: Video,
                step: "03",
                title: "Start Video Sessions",
                description: "Connect via secure video calls. Get personalized exercises and track your progress."
              }
            ].map((item, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card variant="gradient" className="h-full p-8 text-center relative overflow-hidden group">
                  <div className="absolute top-4 right-4 text-6xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                    {item.step}
                  </div>
                  <div className="relative z-10">
                    <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                      <item.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="space-y-4">
                <Badge variant="secondary">Why Choose Us</Badge>
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Professional Care,{" "}
                  <span className="text-primary">Personalized</span> for You
                </h2>
                <p className="text-muted-foreground">
                  Experience the convenience of virtual physiotherapy without compromising on quality.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "Certified and experienced physiotherapists",
                  "Personalized treatment plans",
                  "Flexible scheduling - 24/7 availability",
                  "Progress tracking and exercise videos",
                  "Secure, HIPAA-compliant video calls",
                  "Affordable subscription plans"
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>

              <Link to="/questionnaire">
                <Button variant="hero" size="lg">
                  Start Assessment
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card variant="gradient" className="p-6 text-center">
                <p className="text-4xl font-bold text-primary mb-2">10K+</p>
                <p className="text-sm text-muted-foreground">Happy Patients</p>
              </Card>
              <Card variant="gradient" className="p-6 text-center mt-8">
                <p className="text-4xl font-bold text-primary mb-2">500+</p>
                <p className="text-sm text-muted-foreground">Therapists</p>
              </Card>
              <Card variant="gradient" className="p-6 text-center">
                <p className="text-4xl font-bold text-primary mb-2">50K+</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </Card>
              <Card variant="gradient" className="p-6 text-center mt-8">
                <p className="text-4xl font-bold text-primary mb-2">4.9</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="container">
          <motion.div 
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Your Recovery?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Take the first step towards a pain-free life. Our certified physiotherapists are ready to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/questionnaire">
                <Button 
                  size="xl" 
                  className="bg-background text-primary hover:bg-background/90"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
              <Link to="/plans">
                <Button 
                  variant="outline" 
                  size="xl"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  View Plans
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

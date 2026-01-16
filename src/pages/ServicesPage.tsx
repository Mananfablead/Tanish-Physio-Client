import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EnhancedServicesGrid } from "@/components/ui/EnhancedServicesGrid";
import {
  ShieldCheck,
  UserCheck,
  Home,
  TrendingUp,
  ArrowRight,
  Lock,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchAllServices } from "@/store/slices/serviceSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "@/store";
import type { AppDispatch } from "@/store";

export default function ServicesPage() {
  const dispatch: AppDispatch = useDispatch();
  const { services, loading, error } = useSelector((state: RootState) => state.services);
  useEffect(() => {
    dispatch(fetchAllServices());
  }, [dispatch]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-slate-600">Loading services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg text-red-600">Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-secondary/10 pt-16 pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] translate-y-1/2" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6">
              Our Specialized Services
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
              Expert-led, personalized physiotherapy care designed to help you
              achieve optimal health and wellness. Our team of certified
              specialists provides comprehensive treatment options tailored to
              your unique needs.
            </p>

            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="h-12 px-8 rounded-xl font-black text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                Book Appointment
              </Button>
            </div> */}

            {/* Stats Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="font-bold text-slate-700">
                  Evidence-Based Treatment
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-bold text-slate-700">
                  Personalized Care Plans
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
                <Lock className="h-5 w-5 text-primary" />
                <span className="font-bold text-slate-700">
                  Secure & Private Care
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid Section */}
      <div className="container ">
        <EnhancedServicesGrid services={services} />
      </div>

      {/* Highlight Section */}
      {/* <div className="bg-gradient-to-r from-primary/5 to-accent/5 py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Why Choose Our Services?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We're committed to providing the highest quality care through our proven approach and expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Certified Specialists</h3>
              <p className="text-slate-600">
                All our therapists are certified professionals with extensive experience in their specialized fields.
              </p>
            </Card>

            <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Personalized Care Plans</h3>
              <p className="text-slate-600">
                Each treatment plan is tailored to your specific condition, goals, and lifestyle.
              </p>
            </Card>

            <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <Home className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Home Visit Available</h3>
              <p className="text-slate-600">
                For your convenience, we offer in-home physiotherapy services when needed.
              </p>
            </Card>

            <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Proven Recovery Outcomes</h3>
              <p className="text-slate-600">
                Our evidence-based approach ensures effective and lasting recovery results.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Process Section */}
      {/* <div className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            Simple Steps to Recovery
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Getting started with your physiotherapy journey is easy and straightforward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
              <span className="text-2xl font-black text-primary">1</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">Choose a Service</h3>
            <p className="text-slate-600 mb-4">
              Browse our comprehensive list of services and select the one that best matches your needs.
            </p>
          </Card>

          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
              <span className="text-2xl font-black text-primary">2</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">Consult a Specialist</h3>
            <p className="text-slate-600 mb-4">
              Schedule a consultation with our expert physiotherapist to assess your condition.
            </p>
          </Card>

          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
              <span className="text-2xl font-black text-primary">3</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">Start Recovery</h3>
            <p className="text-slate-600 mb-4">
              Begin your personalized treatment plan and start your journey to better health.
            </p>
          </Card>
        </div>
      </div> */}

      {/* CTA Banner */}
      {/* <div className="bg-gradient-to-r from-primary to-accent py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              Ready to Begin Your Recovery?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Take the first step towards a healthier, pain-free life with our expert physiotherapy services.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-14 px-8 rounded-xl font-black text-lg bg-white text-primary hover:bg-slate-100">
                Get Started Today
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl font-black text-lg text-white border-white hover:bg-white/10">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div> */}
    </Layout>
  );
}
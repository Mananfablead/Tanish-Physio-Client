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
  }, []);

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

     
    </Layout>
  );
}
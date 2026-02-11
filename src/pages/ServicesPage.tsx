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
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-secondary/10 pt-8 pb-10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] translate-y-1/2" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
              Specialized Physiotherapy Care
            </h1>
            <p className="text-sm md:text-base text-slate-600 mb-8 max-w-2xl mx-auto">
              Personalized, expert-led treatment to help you recover faster and stay pain-free.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-4 ">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-slate-700">
                  Evidence-Based
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-slate-700">
                  Personalized Plans
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-slate-700">
                  Secure Care
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
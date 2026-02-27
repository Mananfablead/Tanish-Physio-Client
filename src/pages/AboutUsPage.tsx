import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from "@/components/SEO/SEOHead";
import { getSEOConfig } from "@/components/SEO/seoConfig";
import { Quote, ArrowRight } from "lucide-react";
import { fetchAboutPublic, fetchWhyUsPublic } from "../store/slices/cmsSlice";
import { RootState, useAppDispatch } from "../store";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { fetchPublicAdmins } from "@/store/slices/adminSlice";
export default function AboutUsPage() {
  const dispatch = useAppDispatch();
  const {
    about,
    whyUs,
    loading: cmsLoading,
  } = useSelector((state: RootState) => state.cms);
  const {
    admins: publicAdmins,
    loading: adminsLoading,
    error: adminsError,
  } = useSelector((state: RootState) => state.admins);
  useEffect(() => {
    dispatch(fetchAboutPublic());
    dispatch(fetchWhyUsPublic());
    dispatch(fetchPublicAdmins());
  }, [dispatch]);

  if (cmsLoading) {
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
  const highlightTanish = (text?: string) => {
    if (!text) return null;

    const parts = text.split(/(Tanish Physio)/gi);

    return parts.map((part, index) =>
      part.toLowerCase() === "tanish physio" ? (
        <span key={index} className="text-primary font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <Layout>
      <SEOHead {...getSEOConfig("/about")} />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/20 py-20 md:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-secondary/15 via-transparent to-transparent"></div>

          <div className="container relative z-10 text-center px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6 leading-tight">
                {about?.title}
              </h1>

              <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
                {about?.description}
              </p>

              <motion.div
                className="flex justify-center pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {/* <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div> */}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* About Content Section - Left Image, Right Content */}
        {about?.aboutheadline && (
          <section className="py-16 bg-gradient-to-br from-background to-muted/20">
            <div className="container px-4 md:px-8 max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-20 items-center">
                {/* Left Side - Main Image (first from images array) */}
                {about.images && about.images.length > 0 && (
                  <motion.div
                    className="lg:w-1/2 w-full relative"
                    initial={{ opacity: 0, x: -60, scale: 0.9 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                  >
                    {/* Main Large Image */}
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-primary/20 group">
                      <img
                        src={about.images[0]}
                        alt="About Main"
                        className="w-full h-64 sm:h-80 md:h-96 lg:h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    {/* Overlapping Small Image */}
                    <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-6 md:-bottom-16 md:-right-6 w-2/3 sm:w-3/4 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-0  transition-transform duration-500">
                      <img
                        src={about.images[1]}
                        alt="About Secondary"
                        className="w-full h-40 sm:h-48 md:h-52 lg:h-64 object-cover"
                      />
                    </div>

                    {/* <motion.div 
                      className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-white rounded-2xl shadow-2xl p-3 sm:p-4 md:p-5 flex items-center gap-2 sm:gap-3 md:gap-4 w-[280px] sm:w-[320px] md:w-[350px] border border-primary/10"
                      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                    >
                      <div className="relative">
                        <img
                          src={publicAdmins[0]?.profilePicture}
                          alt={publicAdmins[0]?.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-primary/20"
                        />
                       
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{publicAdmins[0]?.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {publicAdmins[0]?.doctorProfile?.education}
                        </p>
                       
                      </div>
                    </motion.div> */}
                  </motion.div>
                )}

                {/* Right Side - Content */}
                <motion.div
                  className="lg:w-1/2 w-full"
                  initial={{ opacity: 0, x: 60, scale: 0.95 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                >
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 rounded-full mb-4 sm:mb-6 border border-primary/20">
                      <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                        {" "}
                        {about?.title}
                      </span>
                    </div>

                    {/* <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-slate-900 mb-4 sm:mb-6 md:mb-8 leading-tight">
                      {about.aboutheadline}
                    </h2> */}
                    <motion.div
                      className="  mb-6   flex items-center gap-2 sm:gap-3 md:gap-4 "
                      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.5,
                        type: "spring",
                        stiffness: 100,
                      }}
                    >
                      <div className="">
                        <img
                          src={publicAdmins[0]?.profilePicture}
                          alt={publicAdmins[0]?.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-primary/20"
                        />
                        {/* <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div> */}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {publicAdmins[0]?.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {publicAdmins[0]?.doctorProfile?.education}
                        </p>
                      </div>
                    </motion.div>

                    <div className="space-y-2">
                      {about?.aboutheadlDescription
                        ?.split("\n\n")
                        .map((paragraph: string, index: number) => (
                          <motion.p
                            key={index}
                            className="text-slate-600 leading-relaxed text-base sm:text-lg font-light"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.6,
                              delay: 0.4 + index * 0.1,
                            }}
                          >
                            {highlightTanish(paragraph)}
                          </motion.p>
                        ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* Stats Section (if Why Us section exists) */}
        <div className="bg-primary mt-16">
          {whyUs && whyUs.stats && whyUs.stats.length > 0 && (
            <div className="container px-4 max-w-7xl mx-auto py-16 ">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {whyUs.stats.map((stat: any, index: number) => (
                  <motion.div
                    key={stat._id || index}
                    className="text-center p-4 sm:p-5 md:p-6 bg-white rounded-2xl shadow-lg border border-primary/10"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-1">
                      {stat.label}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600">
                      {stat.description}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Why Choose Us Section */}
        {whyUs && whyUs.title && (
          <section className="py-20 bg-gradient-to-br from-primary/5 via-white to-secondary/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent"></div>

            <div className="container relative z-10 px-4 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
                {/* Text Content Side */}
                <div className="order-2 lg:order-1">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2 bg-gradient-to-r from-primary/15 to-secondary/15 rounded-full mb-4 sm:mb-6 border border-primary/20"
                  >
                    <span className="text-primary font-bold text-xs sm:text-sm uppercase tracking-widest">
                      Why Choose Us
                    </span>
                  </motion.div>

                  <motion.h2
                    className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4 sm:mb-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                  >
                    {whyUs.title}
                  </motion.h2>

                  <motion.p
                    className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mb-6 sm:mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  >
                    {whyUs.description}
                  </motion.p>

                  {/* Features Section */}
                  {whyUs.features && whyUs.features.length > 0 && (
                    <motion.div
                      className=""
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                    >
                      <div className="">
                        {whyUs.features.map(
                          (feature: string, index: number) => (
                            <motion.div
                              key={index}
                              className="flex items-start space-x-2 sm:space-x-3 py-1.5 sm:py-2"
                              initial={{ opacity: 0, x: -30 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                              <div className="flex-shrink-0 mt-1">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                                  <svg
                                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 13l4 4L19 7"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <span className="text-sm sm:text-base text-slate-700 font-medium group-hover:text-slate-900 transition-colors">
                                {feature}
                              </span>
                            </motion.div>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Image Side */}
                <div className="order-1 lg:order-2">
                  {whyUs.image && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-primary/10 overflow-hidden"
                    >
                      <div className="aspect-square bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl overflow-hidden">
                        <img
                          src={whyUs.image}
                          alt="Why Choose Us"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
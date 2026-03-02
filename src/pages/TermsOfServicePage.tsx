import React, { useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { useSelector } from 'react-redux';
import { fetchTermsPublic, setCmsTerms } from '../store/slices/cmsSlice';
import { RootState, useAppDispatch } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { SEOHead } from "@/components/SEO/SEOHead";
import { getSEOConfig } from "@/components/SEO/seoConfig";

export default function TermsOfServicePage() {
  const dispatch = useAppDispatch();
  const { terms, loading, error } = useSelector(
    (state: RootState) => state.cms
  );

  useEffect(() => {
    dispatch(fetchTermsPublic());
  }, [dispatch]);

  // Fallback content if terms data is not available
  const renderFallbackContent = () => (
    <div className="prose max-w-none">
      <section id="section-1" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="text-muted-foreground mb-4">
          Welcome to Tanish Physio & Fitness. These terms and conditions outline
          the rules and regulations for the use of our platform, located at
          www.tanishphysio.com.
        </p>
        <p className="text-muted-foreground">
          By accessing this website, we assume you accept these terms and
          conditions. Do not continue to use Tanish Physio & Fitness if you do
          not agree to take all of the terms and conditions stated on this page.
        </p>
      </section>

      <section id="section-2" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. License to Use</h2>
        <p className="text-muted-foreground mb-4">
          Unless otherwise stated, Tanish Physio & Fitness and/or its licensors
          own the intellectual property rights for all material on Tanish Physio
          & Fitness. All intellectual property rights are reserved. You may
          access this from Tanish Physio & Fitness for your own personal use
          subjected to restrictions set in these terms and conditions.
        </p>
        <p className="text-muted-foreground">
          You must not reproduce, duplicate, or copy content from this platform
          without our express written permission.
        </p>
      </section>

      <section id="section-3" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          3. User Responsibilities
        </h2>
        <p className="text-muted-foreground mb-4">
          By using our platform, you agree to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Provide accurate and current information during registration</li>
          <li>Maintain the security of your account credentials</li>
          <li>
            Notify us immediately of any unauthorized access to your account
          </li>
          <li>
            Use the platform in compliance with applicable laws and regulations
          </li>
          <li>Not use the platform for any unlawful purpose</li>
          <li>Respect the privacy and rights of other users</li>
        </ul>
      </section>

      <section id="section-4" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Medical Disclaimer</h2>
        <p className="text-muted-foreground mb-4">
          The information provided through our platform is for educational and
          informational purposes only and is not intended as a substitute for
          professional medical advice, diagnosis, or treatment. Always seek the
          advice of your physician or other qualified health provider with any
          questions you may have regarding a medical condition or treatment.
        </p>
        <p className="text-muted-foreground">
          Tanish Physio & Fitness does not recommend or endorse any specific
          tests, physicians, products, procedures, opinions, or other
          information that may be mentioned on our platform. Reliance on any
          information provided by our platform is solely at your own risk.
        </p>
      </section>

      <section id="section-5" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          5. Limitations of Liability
        </h2>
        <p className="text-muted-foreground mb-4">
          In no event shall Tanish Physio & Fitness, nor its directors,
          employees, partners, agents, suppliers, or affiliates, be liable for
          any indirect, incidental, special, consequential, or punitive damages,
          including without limitation, loss of profits, data, use, goodwill, or
          other intangible losses, resulting from or relating to your access to
          or use of the platform.
        </p>
        <p className="text-muted-foreground">
          Our total liability to you for any and all claims arising out of or
          relating to these terms or your use of the platform will not exceed
          the amount you paid us, if any, for using the platform during the 12
          months prior to the event giving rise to the claim.
        </p>
      </section>

      <section id="section-6" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Privacy Policy</h2>
        <p className="text-muted-foreground mb-4">
          Your privacy is important to us. Please review our Privacy Policy to
          understand how we collect, use, and protect your personal information.
          By using our platform, you consent to the collection and use of your
          information as outlined in our Privacy Policy.
        </p>
      </section>

      <section id="section-7" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
        <p className="text-muted-foreground mb-4">
          We reserve the right to modify these terms at any time. Any changes
          will be posted on this page with an updated revision date. Your
          continued use of the platform after such changes constitutes your
          acceptance of the revised terms.
        </p>
        <p className="text-muted-foreground">
          We recommend reviewing these terms periodically for any changes.
          Changes to these terms are effective when they are posted on this
          page.
        </p>
      </section>

      <section id="section-8" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
        <p className="text-muted-foreground">
          If you have any questions about these Terms of Service, please contact
          us at drkhushboo26@gmail.com or through our Contact Us page.
        </p>
      </section>
    </div>
  );

  return (
    <Layout>
      <SEOHead {...getSEOConfig("/terms")} />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full px-0 md:px-0 lg:px-0">
          <Card className="shadow-2xl border-0 rounded-none overflow-hidden">
            <CardHeader className="bg-gradient-to-b from-primary/10 to-secondary/10 text-slate-900 text-center py-16 relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2" />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] translate-y-1/2" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight relative z-10 text-slate-900">
                {loading ? "Loading..." : terms?.title || "Terms of Service"}
              </h1>
              {/* <p className="text-slate-600 mt-3 text-lg font-medium relative z-10">
                Last updated: {terms?.lastUpdated ? new Date(terms.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()}
              </p> */}
            </CardHeader>
            <CardContent className="p-0 bg-gradient-to-b from-white via-gray-50 to-gray-100">
              <div className="flex flex-col">
                {/* Main Content */}
                <div className="w-full p-8 md:p-12 lg:p-16">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-6"></div>
                      <p className="text-gray-600 text-lg">
                        Loading terms of service...
                      </p>
                    </div>
                  ) : terms && terms.content ? (
                    <div className="prose prose-lg max-w-none">
                      <div
                        dangerouslySetInnerHTML={{ __html: terms.content }}
                      />
                    </div>
                  ) : (
                    <div className="prose prose-lg max-w-none">
                      {renderFallbackContent()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
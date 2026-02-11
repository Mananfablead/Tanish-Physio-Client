import React, { useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { useSelector } from 'react-redux';
import { fetchTermsPublic, setCmsTerms } from '../store/slices/cmsSlice';
import { RootState, useAppDispatch } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';

export default function TermsOfServicePage() {
  const dispatch = useAppDispatch();
  const { terms, loading, error } = useSelector((state: RootState) => state.cms);

  useEffect(() => {
    dispatch(fetchTermsPublic());
  }, [dispatch]);

  // Fallback content if terms data is not available
  const renderFallbackContent = () => (
    <div className="prose max-w-none">
      <section id="section-1" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="text-muted-foreground mb-4">
          Welcome to Tanish Physio. These terms and conditions outline the rules and regulations for the use of our platform, located at www.tanishphysio.com.
        </p>
        <p className="text-muted-foreground">
          By accessing this website, we assume you accept these terms and conditions. Do not continue to use Tanish Physio if you do not agree to take all of the terms and conditions stated on this page.
        </p>
      </section>
      
      <section id="section-2" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. License to Use</h2>
        <p className="text-muted-foreground mb-4">
          Unless otherwise stated, Tanish Physio and/or its licensors own the intellectual property rights for all material on Tanish Physio. All intellectual property rights are reserved. You may access this from Tanish Physio for your own personal use subjected to restrictions set in these terms and conditions.
        </p>
        <p className="text-muted-foreground">
          You must not reproduce, duplicate, or copy content from this platform without our express written permission.
        </p>
      </section>
      
      <section id="section-3" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
        <p className="text-muted-foreground mb-4">
          By using our platform, you agree to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Provide accurate and current information during registration</li>
          <li>Maintain the security of your account credentials</li>
          <li>Notify us immediately of any unauthorized access to your account</li>
          <li>Use the platform in compliance with applicable laws and regulations</li>
          <li>Not use the platform for any unlawful purpose</li>
          <li>Respect the privacy and rights of other users</li>
        </ul>
      </section>
      
      <section id="section-4" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Medical Disclaimer</h2>
        <p className="text-muted-foreground mb-4">
          The information provided through our platform is for educational and informational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or treatment.
        </p>
        <p className="text-muted-foreground">
          Tanish Physio does not recommend or endorse any specific tests, physicians, products, procedures, opinions, or other information that may be mentioned on our platform. Reliance on any information provided by our platform is solely at your own risk.
        </p>
      </section>
      
      <section id="section-5" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Limitations of Liability</h2>
        <p className="text-muted-foreground mb-4">
          In no event shall Tanish Physio, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from or relating to your access to or use of the platform.
        </p>
        <p className="text-muted-foreground">
          Our total liability to you for any and all claims arising out of or relating to these terms or your use of the platform will not exceed the amount you paid us, if any, for using the platform during the 12 months prior to the event giving rise to the claim.
        </p>
      </section>
      
      <section id="section-6" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Privacy Policy</h2>
        <p className="text-muted-foreground mb-4">
          Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information. By using our platform, you consent to the collection and use of your information as outlined in our Privacy Policy.
        </p>
      </section>
      
      <section id="section-7" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
        <p className="text-muted-foreground mb-4">
          We reserve the right to modify these terms at any time. Any changes will be posted on this page with an updated revision date. Your continued use of the platform after such changes constitutes your acceptance of the revised terms.
        </p>
        <p className="text-muted-foreground">
          We recommend reviewing these terms periodically for any changes. Changes to these terms are effective when they are posted on this page.
        </p>
      </section>
      
      <section id="section-8" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
        <p className="text-muted-foreground">
          If you have any questions about these Terms of Service, please contact us at drkhushboo26@gmail.com or through our Contact Us page.
        </p>
      </section>
    </div>
  );

  // Function to extract table of contents from content
  const getTableOfContents = () => {
    if (terms && terms.content) {
      // Extract headings from HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(terms.content, 'text/html');
      const headings = doc.querySelectorAll('h1, h2, h3');
      
      return Array.from(headings).map((heading, index) => ({
        id: `section-${index + 1}`,
        text: heading.textContent || `Section ${index + 1}`,
        level: parseInt(heading.tagName.charAt(1))
      }));
    }
    
    // Fallback for default content
    return [
      { id: 'section-1', text: 'Introduction', level: 2 },
      { id: 'section-2', text: 'License to Use', level: 2 },
      { id: 'section-3', text: 'User Responsibilities', level: 2 },
      { id: 'section-4', text: 'Medical Disclaimer', level: 2 },
      { id: 'section-5', text: 'Limitations of Liability', level: 2 },
      { id: 'section-6', text: 'Privacy Policy', level: 2 },
      { id: 'section-7', text: 'Changes to Terms', level: 2 },
      { id: 'section-8', text: 'Contact Information', level: 2 },
    ];
  };
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-white text-center py-8">
              <CardTitle className="text-3xl md:text-4xl font-bold">
                {loading ? 'Loading...' : terms?.title || 'Terms of Service'}
              </CardTitle>
              <p className="text-primary-50 mt-2">
                Last updated: {terms?.lastUpdated ? new Date(terms.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()}
              </p>
              <Badge variant="secondary" className="mt-4 w-fit mx-auto bg-primary/20 text-white">
                Legal Document
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Sidebar */}
                <div className="lg:w-1/4 bg-gray-50 p-6 border-r border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Table of Contents</h3>
                  <nav>
                    <ul className="space-y-2">
                      {getTableOfContents().map((item, index) => (
                        <li key={item.id}>
                          <a 
                            href={`#${item.id}`}
                            className={`block py-2 px-3 rounded-md transition-colors duration-200 ${
                              index % 2 === 0 
                                ? 'text-primary hover:bg-primary/5' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="font-medium">{index + 1}.</span> {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Related Information</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-600">Last updated: {terms?.lastUpdated ? new Date(terms.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-600">Effective immediately</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-600">Applies to all users</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Need Help?</h4>
                    <p className="text-sm text-gray-600 mb-3">Contact our support team for questions about these terms.</p>
                    <button className="w-full py-2 px-4 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors duration-200 text-sm font-medium">
                      Contact Support
                    </button>
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="lg:w-3/4 p-8">
                  
                  
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                      <p className="text-muted-foreground">Loading terms of service...</p>
                    </div>
                  ) : terms && terms.content ? (
                    <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                      <div className="prose prose-primary max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: terms.content }} />
                      </div>
                    </ScrollArea>
                  ) : (
                    <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                      <div className="prose prose-primary max-w-none">
                        {renderFallbackContent()}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
              
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  By using our service, you agree to these terms
                </div>
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                  Effective Now
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          
        </div>
      </div>
    </Layout>
  );
}
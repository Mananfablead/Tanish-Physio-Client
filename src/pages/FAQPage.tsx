import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchFaqsPublic } from '../store/slices/cmsSlice';
import { useAccordion } from '../hooks/useAccordion';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const dispatch = useAppDispatch();
  const { faqs, loading, error } = useAppSelector(state => ({
    faqs: state.cms.faqs,
    loading: state.cms.loading,
    error: state.cms.error
  }));
  
  const { openIndex, toggleAccordion } = useAccordion();

  useEffect(() => {
    dispatch(fetchFaqsPublic());
  }, [dispatch]);

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Frequently Asked Questions</h1>
          <p className="text-center text-muted-foreground mb-12">Find answers to common questions about our services</p>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <div key={faq._id || index} className="border border-primary/20 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md">
                  <button
                    className="w-full flex justify-between items-center p-6 text-left bg-card hover:bg-primary/5 transition-colors duration-200"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={openIndex === index}
                    aria-controls={`faq-content-${index}`}
                  >
                    <h3 className="text-lg font-semibold text-primary pr-4">{faq.question}</h3>
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </button>
                  <div 
                    id={`faq-content-${index}`}
                    className={`${openIndex === index ? 'block' : 'hidden'} p-6 pt-2 border-t bg-background transition-all duration-300`}
                  >
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No FAQs available at the moment.</p>
              </div>
            )}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">Still have questions? Contact our support team for further assistance.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
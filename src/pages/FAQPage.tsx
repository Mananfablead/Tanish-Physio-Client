import React from 'react';

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I book a session?",
      answer: "You can book a session by navigating to the 'Find Therapists' page, selecting a therapist that fits your needs, and choosing an available time slot."
    },
    {
      question: "What are the subscription plans?",
      answer: "We offer multiple subscription plans including monthly and annual options. Visit our 'Subscription Plans' page for detailed information on pricing and features."
    },
    {
      question: "How do I cancel a booking?",
      answer: "You can cancel your booking from your profile page under 'My Appointments'. Please note that cancellations must be made at least 24 hours before the scheduled session."
    },
    {
      question: "What equipment do I need for video sessions?",
      answer: "You'll need a device with a camera and microphone, a stable internet connection, and a quiet, well-lit space for your session."
    },
    {
      question: "Can I change my subscription plan?",
      answer: "Yes, you can upgrade or downgrade your subscription plan at any time from your profile settings."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team through the 'Contact Us' page or by emailing us at drkhushboo26@gmail.com"
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Frequently Asked Questions</h1>
        <p className="text-center text-muted-foreground mb-12">Find answers to common questions about our services</p>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-lg p-6 bg-card">
              <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">Still have questions? Contact our support team for further assistance.</p>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from "@/components/SEO/SEOHead";
import { PAGE_SEO } from "@/components/SEO/seoConfig";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchContactPublic } from "../store/slices/cmsSlice";
import { RootState } from "../store";
import { toast } from "sonner";

export default function ContactUsPage() {
  const dispatch = useDispatch();
  const { contact, loading } = useSelector((state: RootState) => state.cms);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchContactPublic() as any);
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/cms/public/contact-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Message sent successfully! We will get back to you soon."
        );
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(
          data.message || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEOHead {...PAGE_SEO["/contact"]} />

      <div className="min-h-screen bg-background ">
        <div>
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-6 pt-8 pb-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
            <div className="container relative z-10 text-center space-y-4">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-4 leading-snug">
                {contact?.title || "Contact Us"}
              </h1>
              <p className="text-sm md:text-base text-slate-600 mb-8 max-w-2xl mx-auto">
                {contact?.description || "Get in touch with our support team"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 container px-4 max-w-6xl mx-auto mt-6">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                {contact?.description ||
                  "Have questions or need assistance? Our team is here to help you with any inquiries you may have about our services, appointments, or support."}
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-muted-foreground">
                      drkhushboo26@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-muted-foreground">+91 9427555696</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-muted-foreground">
                      {contact?.address ||
                        "5, Dhaval Appts, Besides Telephone Exchange, Choksiwadi Road, Ajaramar Chowk, Adajan"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
                <p className="text-muted-foreground mb-4">
                  {contact?.hours ||
                    "Monday - Friday: 9:00 AM - 7:00 PM, Saturday: 10:00 AM - 4:00 PM, Sunday: Closed"}
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2"
                    >
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
                  >
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-2"
                  >
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                    rows={5}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Map Section - Full Width */}
          <div className="container px-4 max-w-6xl mx-auto mt-12 mb-5">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Find Us Here
            </h3>
            <div className="rounded-lg overflow-hidden border">
              {contact?.latitude && contact?.longitude ? (
                // Use coordinates for precise location
                <iframe
                  width="100%"
                  height="400"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${contact.latitude},${contact.longitude}&z=15&output=embed`}
                  title="Location Map"
                ></iframe>
              ) : (
                // Fallback to address-based search
                <iframe
                  width="100%"
                  height="400"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    contact?.address ||
                      "5, Dhaval Appts, Besides Telephone Exchange, Choksiwadi Road, Ajaramar Chowk, Adajan"
                  )}&output=embed`}
                  title="Location Map"
                ></iframe>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
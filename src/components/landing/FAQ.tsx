import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FAQProps {
  cmsFaqs: any[];
}

export const FAQ = ({ cmsFaqs }: FAQProps) => {
  const navigate = useNavigate();
  return (
    <section className="py-10 bg-muted/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              Support
            </Badge>

            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Frequently Asked Questions
            </h2>

            <p className="text-muted-foreground mb-8">
              Find answers to common questions about our services and
              consultation process. Still have questions? Feel free to get in
              touch.
            </p>

            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-slate-900">
                  Need More Assistance?
                </h3>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Get expert guidance and personalized support for any questions
                related to your consultation or treatment plan.
              </p>

              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => navigate("/contact")}
              >
                Get in Touch
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="w-full space-y-4">
              {(cmsFaqs && cmsFaqs.length > 0
                ? cmsFaqs
                : [
                    {
                      question: "Is online physiotherapy effective?",
                      answer:
                        "Yes, research shows that virtual physiotherapy is highly effective for many conditions. It combines professional guidance with home-based exercises that are easy to follow and track.",
                    },
                    {
                      question: "Do I need any special equipment?",
                      answer:
                        "Most sessions can be done with minimal equipment found at home (like towels or chairs). If specific equipment is needed, your therapist will guide you on alternatives or what to purchase.",
                    },
                    {
                      question: "Can I cancel my subscription anytime?",
                      answer:
                        "Absolutely! We offer flexible plans with no long-term contracts. You can cancel or pause your subscription at any time through your dashboard.",
                    },
                    {
                      question: "Is my personal and medical data secure?",
                      answer:
                        "We take your privacy seriously. Our platform is fully secure, and all your sessions and medical data are encrypted and stored securely.",
                    },
                    {
                      question: "Are the video sessions recorded?",
                      answer:
                        "No, sessions are not recorded without your explicit consent. Your privacy is our priority, and all consultations are private between you and your therapist.",
                    },
                  ]
              ).map((faq: any, i: number) => (
                <AccordionItem
                  key={faq._id || i}
                  value={`item-${i}`}
                  className="gradient-primary dark:bg-gray-900 rounded-xl px-6 border-none shadow-sm"
                >
                  <AccordionTrigger className="text-left font-semibold py-5 hover:no-underline text-white">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-white pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

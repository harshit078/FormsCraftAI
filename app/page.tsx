"use client";

import { useAuth } from "@/lib/auth-context";
import { FormBuilder } from "@/components/form-builder";
import Navbar from "@/components/ui/navbar";
import Hero from "@/components/ui/hero";
import ToolsSection from "@/components/ui/toolssection";
import Footer from "@/components/ui/footer";
import { FaqSection } from "@/components/ui/Faq";
import LinkedService from "@/components/ui/linked-service";
import { motion } from "framer-motion";
import { fadeUp } from "@/components/ui/animation-value";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, FileText, Zap } from "lucide-react";
import Image from "next/image";
import { FeatureSteps } from "@/components/ui/features";
import CallToAction from "@/components/ui/get-started";
import { useState, useEffect } from "react";
import { Timeline } from "@/components/ui/timeline";

export default function Home() {
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // If user is authenticated, render FormBuilder
  if (user) {
    return (
      <div className="min-h-screen">
        <FormBuilder />
      </div>
    );
  }

  const data = [
    {
      title: "Write a prompt to generate a form",
      content: (
        <div>
          <div className="flex max-sm:h-[30vh] relative h-[65vh] gap-2">
            <video
              src="/work.mp4"
              className="rounded-lg object-cover w-full "
              autoPlay
            />
          </div>
        </div>
      ),
    },
    {
      title: "AI generates a form for you",
      content: (
        <div>
          <div className="flex max-sm:h-[30vh] relative h-[65vh] gap-2">
            <video
              src="/work2.mp4"
              className="rounded-lg object-cover w-full "
              autoPlay
            />
          </div>
        </div>
      ),
    },
    {
      title: "Share the form",
      content: (
        <div>


          <div className="flex max-sm:h-[30vh] relative h-[65vh] gap-2">
            <video
              src="/work3.mp4"
              className="rounded-lg object-cover w-full "
              autoPlay
            />
          </div>
        </div>
      ),
    },
  ];

  // Your existing FAQ data
  const DEMO_FAQS = [
    {
      question: "What platforms can I create forms",
      answer:
        "FormsCraftAI currently supports creating forms on Google Forms, SurveyMonkey, and Typeform. We're continuously working to add support for more platforms in the future.",
    },
    {
      question: "Is Google account needed for Google form",
      answer:
        "Yes, you need a Google account to create Google Forms through FormsCraftAI. You'll also need to grant the app necessary permissions to create forms on your behalf.",
    },
    {
      question: "How do I access the forms I've created?",
      answer:
        "After creating a form, FormsCraftAI provides a direct link to the form on the respective platform (Google Forms, SurveyMonkey, or Typeform). You can also access them directly from your account on those platforms.",
    },
    {
      question:
        "Is there a limit to the questions",
      answer:
        "The question limit depends on the platform you're using. Google Forms, SurveyMonkey, and Typeform have their own limitations. Please refer to their respective documentation for details.",
    },
    {
      question: "How secure is my data",
      answer:
        "We prioritize the security of your data. FormsCraftAI uses security measures, including encryption and secure authentication, to protect your information.",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-background to-background/80">
      <Navbar />
      <section className="container mx-auto px-4 py-12 lg:flex-row items-center gap-12">
        <Hero />
      </section>

      {/* Features Section */}

      <section className="container mx-auto px-4 py-12  items-center gap-12">
      <div className="top-0 left-0 w-full">
        <Timeline data={data} />
      </div>
      </section>

    
      <section className="container mx-auto px-4 py-12 mt-12 mb-12  items-center gap-12">
        <ToolsSection />
      </section>

      <section className="container mx-auto px-4 py-12 mt-12 mb-12  items-center gap-12">
        <FaqSection
          title="Frequently Asked Questions"
          description="Everything you need to know about"
          items={DEMO_FAQS}
          contactInfo={{
            title: "Still have questions?",
            description: "We're here to help you",
            buttonText: "Contact Support",
            onContact: () => console.log("Contact support clicked"),
          }}
        />
      </section>
      <section className="flex mt-24">
        <CallToAction />
      </section>
      <Footer />
    </div>
  );
}

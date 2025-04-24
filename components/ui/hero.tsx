import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { SparklesText } from "./sparkles";
import { AnimatedGradientText } from "./animated-text";
import { ny } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { ButtonCta } from "./button-shiny";
import { ContainerScroll } from "./container-scroll";
const Hero = () => {
  const { user, loading, error, signInWithGoogle, signOutUser } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };
  return (
<section className="pt-24 pb-20 relative overflow-hidden">
  <div className="container-custom relative z-10">
    <AnimatedGradientText>
      <svg
        className="w-6 h-6 mr-2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
      >
        <path
          d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.016 0 000 8.016v-.032A8.521 8.016 0 007.984 0h.032A8.522 8.016 0 0016 7.984v.032z"
          fill="url(#prefix__paint0_radial_980_20147)"
        />
        <defs>
          <radialGradient
            id="prefix__paint0_radial_980_20147"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)"
          >
            <stop offset=".067" stopColor="#9168C0" />
            <stop offset=".343" stopColor="#5684D1" />
            <stop offset=".672" stopColor="#1BA1E3" />
          </radialGradient>
        </defs>
      </svg>
      <span
        className={ny(
          `animate-gradient inline bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
        )}
      >
        Uses Gemini 2.0
      </span>
    </AnimatedGradientText>

    <div className="max-w-6xl mt-6 mx-auto text-center mb-12 md:mb-16">
      <h1 className="text-5xl md:text-8xl font-bold mb-6 leading-tight text-white">
        Form Generation
        <br />
        got easy
        <SparklesText className="mt-5" text="AI Integration" />
      </h1>

      <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
        FormsCraftAI helps you create forms/surveys with just one prompt. No
        need to spend hours creating forms, let AI do the work for you.
      </p>

      <div className="md:hidden flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignIn}
          className="relative flex  transition-all duration-200"
        >
          <ButtonCta className="w-full"></ButtonCta>
        </motion.button>
      </div>
    </div>

    {/* Hero Image - AI Demo */}

    <div className="relative mx-auto h-auto max-w-7xl rounded-full">
        <ContainerScroll
      >
          <video
            src="/demo.mp4"
            className="w-full h-auto rounded-lg" // Make video take full width
            autoPlay
            muted
            loop
            playsInline // Add playsInline for mobile compatibility
          />
        </ContainerScroll>
    </div>
  </div>
</section>
  );
};

export default Hero;

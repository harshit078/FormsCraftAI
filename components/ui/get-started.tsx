import React from 'react';
import { Button } from '@/components/ui/button';
import { BackgroundGradientAnimation } from './background';

const CallToAction = () => {
  return (
      <BackgroundGradientAnimation>
    <section className="relative overflow-hidden">
        <div className="container-custom text-center">

          {/* Large Postiz logo */}
          <div className="mt-20 relative">
            <svg viewBox="120 0 600 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-8xl mx-auto">
              <text
                x="130"
                y="150"
                fontSize="105"
                fill="#D946EF"
                fontWeight="bold" // Make the font bold
                fontFamily="cursive"
              >
                FormCraftAI
              </text>
            </svg>
          </div>
        </div>
    </section>
      </BackgroundGradientAnimation>
  );
};

export default CallToAction;
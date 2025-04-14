import React from "react";
import { Button } from "@/components/ui/button";
import { Mac } from "./mac";

const ToolsSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container">
        <h2 className="text-8xl mb-12 text-center items-center max-sm:text-4xl font-semibold bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
          Features in <br />
          <span className="text-center">
            one place{" "}
            <span className=" bottom-12 left-12 w-full h-1 blue-gradient"></span>
          </span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scheduling Tool Section */}
          <div className="bg-[#5618B5] bg-opacity-80 rounded-3xl p-8 md:p-10 overflow-hidden">
            <div className="bg-[#853AC3] text-white text-sm font-semibold py-1 px-3 rounded-full inline-block mb-6">
              PLANNING
            </div>
            <h3 className="text-4xl mb-12 text-center items-center max-sm:text-4xl font-semibold bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
              Seamless scheduling
            </h3>
            <p className="text-gray-200 mb-8">
              Schedule, analyze, and engage with your audience. Cross post your
              social media posts into multiple channels.
            </p>

            <div className="relative">
              <Mac
                src="https://utfs.io/f/1c7648bd-2c01-4cc8-9aeb-57996b5bc1ea-xh7cft.jpg"
                className="size-small max-sm:size-[75vw]"
              />
            </div>
          </div>

          {/* AI Content Assistant Section */}
          <div className="bg-[#5618B5] bg-opacity-40 rounded-3xl p-8 md:p-10 overflow-hidden">
            <div className="bg-[#853AC3] text-white text-sm font-semibold py-1 px-3 rounded-full inline-block mb-6">
              ARTIFICIAL INTELLIGENCE
            </div>
            <h3 className="text-4xl mb-12 text-center items-center max-sm:text-4xl font-semibold bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
              AI Content assistant
            </h3>
            <p className="text-lg mb-12 text-center items-center max-sm:text-4xl  bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
              Improve your content creation process with AI Agent that performs
              all tasks for you.
            </p>

            <div className="relative">
              <img
                src="/big3.png"
                alt="AI Content Assistant"
                className="w-full h-auto rounded-3xl"
              />
            </div>
          </div>
        </div>

        {/* Media Design Section */}
        <div className="mt-8 bg-[#100D3F] rounded-3xl p-8 overflow-hidden">
          <div className="flex justify-center">
          <h3 className="text-4xl mb-12 text-center items-center max-sm:text-4xl font-semibold bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
              Seamless scheduling
            </h3>
            <p className="text-gray-200 mb-8">
              Schedule, analyze, and engage with your audience. Cross post your
              social media posts into multiple channels.
            </p>

            <div className="relative">
              <Mac
                src="/big3.png"
                className="size-small max-sm:size-[75vw]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;

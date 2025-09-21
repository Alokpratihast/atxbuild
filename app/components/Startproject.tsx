"use client";

import Contact from "@/components/ContactForm";
import GetInTouch from "@/components/GetInTouch";

export default function ContactSection() {
  return (
    <section className="py-12 px-6 max-w-7xl mx-auto"id="start-project">
      <div className="grid lg:grid-cols-3 gap-10 items-stretch">
        
        {/* Left side → Contact Form */}
        <div className="lg:col-span-2">
          <Contact />
        </div>

        {/* Right side → GetInTouch + Map */}
        <div className="flex flex-col h-full">
          {/* Top Block - Get In Touch */}
          <div className="flex-1">
            <GetInTouch />
          </div>

         
          
        </div>
      </div>
    </section>
  );
} 
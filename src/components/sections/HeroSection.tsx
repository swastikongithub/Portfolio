import React from 'react';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { EditorialImage } from '../ui/EditorialImage';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import portraitImg from '../../assets/portfoliopic.jpeg';

export const HeroSection: React.FC = () => {
  const scrollToWork = () => {
    document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between pt-28 md:pt-36 pb-12 md:pb-20 max-w-7xl mx-auto px-6 md:px-12">
      {/* Top Metadata Row: Swiss Grid Journal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono uppercase tracking-widest text-[#666666] dark:text-[#888888] pb-6 border-b border-[#1F1F1F]/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#FF4D2D] rounded-full inline-block" />
          <span>PORTFOLIO // VOL. 2026</span>
        </div>
        <span>BACKEND ENGINEERING • SYSTEM ARCHITECTURE</span>
        <span>BASED IN INDIA</span>
      </div>

      {/* Main Asymmetrical Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center my-auto py-8">
        {/* Left Column (7 cols): Massive Display Typography & Authentic Personal Intro */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="mb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF4D2D] block mb-2">
              ENGINEERING CRAFTSMANSHIP
            </span>
            <h1 className="font-display font-extrabold text-[15vw] lg:text-[9.5rem] leading-[0.88] tracking-tighter text-[#111111] dark:text-[#F5F5F5]">
              SWASTIK
            </h1>
          </div>

          {/* Personal & Authentic Intro (Replacing generic placeholder text) */}
          <div className="max-w-xl">
            <p className="text-lg md:text-2xl font-light leading-relaxed text-[#111111] dark:text-[#F5F5F5] mb-8">
              A computer science student and backend developer obsessed with simplicity, reliability, and architectural clarity. I build distributed systems, clean APIs, and secure backend architectures without unnecessary complexity.
            </p>

            {/* Oversized CTA Button */}
            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={scrollToWork}
                className="group inline-flex items-center gap-4 px-8 py-4 bg-[#111111] dark:bg-[#F5F5F5] text-[#FAFAFA] dark:text-[#111111] text-xs md:text-sm font-mono uppercase tracking-widest hover:bg-[#FF4D2D] dark:hover:bg-[#FF4D2D] dark:hover:text-white transition-all duration-300 rounded-none"
              >
                <span>EXPLORE WORK</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </button>

              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-xs md:text-sm font-mono uppercase tracking-widest text-[#111111] dark:text-[#F5F5F5] hover:text-[#FF4D2D] dark:hover:text-[#FF4D2D] transition-colors py-2"
              >
                <span>GITHUB REPOSITORY</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Massive High-Contrast Portrait */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
          <EditorialImage
            src={portraitImg}
            alt="Swastik Singh portrait"
            aspectRatio="portrait"
            badge="01 // ARCHITECT"
            className="w-full shadow-2xl"
          />
        </div>
      </div>

      {/* Bottom Editorial Scroll Indicator */}
      <div className="flex items-center justify-between pt-6 border-t border-[#1F1F1F]/10 dark:border-white/10 text-xs font-mono uppercase tracking-widest text-[#666666] dark:text-[#888888]">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-[#FF4D2D] rounded-full animate-ping" />
          <span>SCROLL FOR REAL ENGINEERING CASE STUDIES</span>
        </div>
        <span className="hidden sm:inline">01 / 05 // INDEX</span>
      </div>
    </section>
  );
};

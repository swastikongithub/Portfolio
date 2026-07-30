import React from 'react';
import { PERSONAL_INFO } from '../../data/portfolioData';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 md:py-36 max-w-7xl mx-auto px-6 md:px-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 pb-8 border-b border-[#1F1F1F]/10 dark:border-white/10 gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF4D2D] block mb-2">
            05 // PHILOSOPHY & CRAFTSMANSHIP
          </span>
          <h2 className="font-display font-extrabold text-5xl md:text-8xl tracking-tighter uppercase text-[#111111] dark:text-[#F5F5F5]">
            ENGINEERING ETHOS
          </h2>
        </div>
        <p className="max-w-md text-xs md:text-sm font-mono uppercase tracking-widest text-[#666666] dark:text-[#888888]">
          BUILDING DISTRIBUTED BACKENDS WITH CLARITY, RELIABILITY & INTENT
        </p>
      </div>

      {/* Editorial Magazine Typography Spread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column (5 cols): Genuine Approach Statement */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full gap-8">
          <div className="border-l-2 border-[#FF4D2D] pl-6 py-1">
            <h3 className="font-display font-bold text-2xl md:text-4xl leading-tight text-[#111111] dark:text-[#F5F5F5]">
              &ldquo;Software architecture is not about adding layers until it looks enterprise—it is about removing friction until the system cannot fail.&rdquo;
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-[#666666] dark:text-[#888888]">
            <span>SWASTIK SINGH</span>
            <span>//</span>
            <span>BACKEND ENGINEER</span>
          </div>
        </div>

        {/* Right Column (7 cols): Editorial Narrative */}
        <div className="lg:col-span-7 flex flex-col gap-8 text-base md:text-xl font-light leading-relaxed text-[#111111] dark:text-[#F5F5F5]">
          <p>
            My engineering work centers on distributed systems, concurrent transaction handling, and resilient queue-based pipelines. Whether designing an email scheduling engine capable of handling high-volume retries or architecting secure cryptographic file storage systems, my focus is always on data integrity and clean execution.
          </p>
          <p className="text-[#666666] dark:text-[#888888]">
            I believe the best backend systems are invisible to the user—they operate with predictable latency, recover gracefully from network partitions, and remain maintainable as requirements evolve.
          </p>

          {/* Quick Stat / Focus Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-[#1F1F1F]/10 dark:border-white/10">
            <div>
              <span className="font-mono text-xs text-[#FF4D2D] block mb-1">PRIMARY DOMAIN</span>
              <span className="font-display font-bold text-lg">Backend Systems</span>
            </div>
            <div>
              <span className="font-mono text-xs text-[#FF4D2D] block mb-1">CORE LANGUAGES</span>
              <span className="font-display font-bold text-lg">Java &bull; TS &bull; Python</span>
            </div>
            <div>
              <span className="font-mono text-xs text-[#FF4D2D] block mb-1">STATUS</span>
              <span className="font-display font-bold text-lg">Open for Roles</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

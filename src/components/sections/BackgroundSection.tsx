import React from 'react';
import { MILESTONES } from '../../data/portfolioData';

export const BackgroundSection: React.FC = () => {
  return (
    <section id="background" className="py-24 md:py-36 max-w-7xl mx-auto px-6 md:px-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 pb-8 border-b border-[#1F1F1F]/10 dark:border-white/10 gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF4D2D] block mb-2">
            03 // CREDENTIALS & BACKGROUND
          </span>
          <h2 className="font-display font-extrabold text-5xl md:text-8xl tracking-tighter uppercase text-[#111111] dark:text-[#F5F5F5]">
            EDUCATION & MILESTONES
          </h2>
        </div>
        <p className="max-w-md text-xs md:text-sm font-mono uppercase tracking-widest text-[#666666] dark:text-[#888888]">
          ACADEMIC FOUNDATION • TECHNICAL EXPERTISE • VERIFIED ACHIEVEMENTS
        </p>
      </div>

      {/* Editorial Timeline Grid */}
      <div className="flex flex-col divide-y divide-[#1F1F1F]/10 dark:divide-white/10">
        {MILESTONES.map((item) => (
          <div
            key={item.id}
            className="py-10 md:py-14 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start"
          >
            {/* Year & Category */}
            <div className="md:col-span-3 flex md:flex-col justify-between md:justify-start gap-2">
              <span className="font-mono text-xl md:text-3xl font-bold tracking-tight text-[#111111] dark:text-[#F5F5F5]">
                {item.year}
              </span>
              <span className="inline-block text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 bg-[#111111]/5 dark:bg-white/10 text-[#FF4D2D] w-fit">
                {item.category}
              </span>
            </div>

            {/* Title & Organization */}
            <div className="md:col-span-5">
              <h3 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-[#111111] dark:text-[#F5F5F5] mb-2">
                {item.title}
              </h3>
              <p className="text-sm font-mono uppercase tracking-wider text-[#666666] dark:text-[#888888]">
                {item.organization}
              </p>
            </div>

            {/* Concise Description */}
            <div className="md:col-span-4">
              <p className="text-sm text-[#666666] dark:text-[#888888] font-light leading-relaxed">
                {item.description}
              </p>
              {item.highlight && (
                <div className="mt-3 text-xs font-mono uppercase tracking-widest text-[#111111] dark:text-[#F5F5F5] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FF4D2D] rounded-full inline-block" />
                  <span>{item.highlight}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

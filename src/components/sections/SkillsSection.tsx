import React from 'react';
import { SKILL_GROUPS } from '../../data/portfolioData';

export const SkillsSection: React.FC = () => {
  return (
    <section id="skills" className="py-24 md:py-36 max-w-7xl mx-auto px-6 md:px-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 pb-8 border-b border-[#1F1F1F]/10 dark:border-white/10 gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF4D2D] block mb-2">
            04 // TECHNICAL EXPERTISE
          </span>
          <h2 className="font-display font-extrabold text-5xl md:text-8xl tracking-tighter uppercase text-[#111111] dark:text-[#F5F5F5]">
            SYSTEMS & STACK
          </h2>
        </div>
        <p className="max-w-md text-xs md:text-sm font-mono uppercase tracking-widest text-[#666666] dark:text-[#888888]">
          CURATED ARCHITECTURAL TOOLKIT • DISTRIBUTED SYSTEMS • CLEAN API DESIGN
        </p>
      </div>

      {/* Editorial Grouped Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        {SKILL_GROUPS.map((group, groupIdx) => (
          <div
            key={group.category}
            className="flex flex-col border-t-2 border-[#111111] dark:border-white pt-6"
          >
            {/* Category Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-mono text-sm uppercase tracking-widest font-semibold text-[#111111] dark:text-[#F5F5F5]">
                {group.category}
              </h3>
              <span className="font-mono text-xs text-[#FF4D2D]">
                0{groupIdx + 1}
              </span>
            </div>

            {/* List of Skills in Editorial Typeset */}
            <ul className="flex flex-col gap-3">
              {group.skills.map((skill) => (
                <li
                  key={skill}
                  className="group flex items-center justify-between py-2 border-b border-[#1F1F1F]/10 dark:border-white/10 hover:border-[#FF4D2D] transition-colors"
                >
                  <span className="font-display text-lg md:text-xl font-normal text-[#111111] dark:text-[#F5F5F5] group-hover:text-[#FF4D2D] transition-colors">
                    {skill}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F1F1F]/20 dark:bg-white/20 group-hover:bg-[#FF4D2D] transition-colors" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

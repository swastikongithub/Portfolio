import React from 'react';
import { Link } from 'react-router-dom';
import { PROJECTS } from '../../data/portfolioData';
import { ArrowUpRight } from 'lucide-react';

export const WorkSection: React.FC = () => {
  return (
    <section id="work" className="py-24 md:py-36 max-w-7xl mx-auto px-6 md:px-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 pb-8 border-b border-[#1F1F1F]/10 dark:border-white/10 gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF4D2D] block mb-2">
            02 // CASE STUDIES
          </span>
          <h2 className="font-display font-extrabold text-5xl md:text-8xl tracking-tighter uppercase text-[#111111] dark:text-[#F5F5F5]">
            SELECTED WORK
          </h2>
        </div>
        <p className="max-w-md text-xs md:text-sm font-mono uppercase tracking-widest text-[#666666] dark:text-[#888888]">
          AUTHENTIC ENGINEERING CASE STUDIES • SCALABLE BACKENDS • SECURE BACKEND ARCHITECTURES
        </p>
      </div>

      {/* Magazine-Inspired Project List */}
      <div className="flex flex-col divide-y divide-[#1F1F1F]/10 dark:divide-white/10">
        {PROJECTS.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="group py-12 md:py-16 flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start lg:items-center transition-colors hover:bg-[#111111]/[0.02] dark:hover:bg-white/[0.02] -mx-6 px-6"
          >
            {/* Huge Project Number */}
            <div className="lg:col-span-2 flex items-center gap-4">
              <span className="font-mono text-3xl md:text-5xl font-light text-[#666666] dark:text-[#888888] group-hover:text-[#FF4D2D] transition-colors">
                {project.number}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border border-[#1F1F1F]/20 dark:border-white/20 text-[#666666] dark:text-[#888888]">
                {project.year}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              <h3 className="font-display font-bold text-3xl md:text-5xl tracking-tight text-[#111111] dark:text-[#F5F5F5] group-hover:text-[#FF4D2D] transition-colors">
                {project.title}
              </h3>
              <p className="text-sm md:text-base text-[#666666] dark:text-[#888888] font-light">
                {project.subtitle}
              </p>
            </div>

            {/* Architecture Highlights & Tags */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] font-mono uppercase tracking-wider px-2 py-1 bg-[#111111]/5 dark:bg-white/5 text-[#111111] dark:text-[#F5F5F5]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#666666] dark:text-[#888888] line-clamp-2">
                {project.summary}
              </p>
            </div>

            {/* Editorial Action Arrow */}
            <div className="lg:col-span-1 flex justify-end w-full lg:w-auto">
              <div className="w-12 h-12 flex items-center justify-center border border-[#1F1F1F]/20 dark:border-white/20 group-hover:border-[#FF4D2D] group-hover:bg-[#FF4D2D] group-hover:text-white transition-all duration-300">
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

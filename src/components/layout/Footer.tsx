import React from 'react';
import { PERSONAL_INFO } from '../../data/portfolioData';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-16 md:py-24 border-t border-[#1F1F1F]/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-[#0A0A0A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-between gap-16">
        {/* Top bar: concise copyright & editorial badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono uppercase tracking-widest text-[#666666] dark:text-[#888888]">
          <span>© 2026 SWASTIK SINGH — ALL RIGHTS RESERVED</span>
          <span>SWISS EDITORIAL ARCHITECTURE • 0% FABRICATION</span>
        </div>

        {/* Massive Typography Name / Brand */}
        <div className="w-full flex justify-between items-end border-b border-[#1F1F1F]/10 dark:border-white/10 pb-8">
          <h2 className="font-display font-extrabold text-[12vw] leading-none tracking-tighter text-[#111111] dark:text-[#F5F5F5] select-none">
            SWASTIK
          </h2>
          <span className="w-4 h-4 md:w-6 md:h-6 bg-[#FF4D2D] rounded-full mb-2 md:mb-6 shrink-0" />
        </div>

        {/* Bottom Social & Links */}
        <div className="flex flex-wrap items-center justify-between gap-6 text-xs font-mono uppercase tracking-widest">
          <div className="flex flex-wrap items-center gap-6">
            <a
              href={PERSONAL_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF4D2D] transition-colors"
            >
              GitHub
            </a>
            <a
              href={PERSONAL_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF4D2D] transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={PERSONAL_INFO.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF4D2D] transition-colors"
            >
              Twitter
            </a>
            <a
              href={PERSONAL_INFO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF4D2D] transition-colors"
            >
              Instagram
            </a>
            <a
              href={PERSONAL_INFO.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF4D2D] transition-colors"
            >
              Resume
            </a>
          </div>

          <span className="text-[#666666] dark:text-[#888888]">
            AVAILABLE FOR BACKEND OPPORTUNITIES
          </span>
        </div>
      </div>
    </footer>
  );
};

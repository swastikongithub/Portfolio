import React, { useState } from 'react';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { Mail, ArrowUpRight, Check, Copy } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="contact" className="py-24 md:py-36 max-w-7xl mx-auto px-6 md:px-12">
      {/* Editorial Luxury Header & Authentic Closing */}
      <div className="flex flex-col gap-8 max-w-4xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF4D2D] block">
          06 // INITIATE CONTACT
        </span>

        {/* Authentic copy as requested */}
        <h2 className="font-display font-bold text-4xl sm:text-6xl md:text-8xl tracking-tight leading-[0.95] text-[#111111] dark:text-[#F5F5F5]">
          Available for internships and backend engineering opportunities. Let&apos;s talk.
        </h2>
      </div>

      {/* Massive Email Button / Action Spread */}
      <div className="mt-16 md:mt-24 pt-12 border-t border-[#1F1F1F]/10 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${PERSONAL_INFO.email}`}
            className="inline-flex items-center gap-4 px-8 py-5 bg-[#111111] dark:bg-[#F5F5F5] text-[#FAFAFA] dark:text-[#111111] font-mono text-xs md:text-sm uppercase tracking-widest hover:bg-[#FF4D2D] dark:hover:bg-[#FF4D2D] dark:hover:text-white transition-all duration-300 rounded-none"
          >
            <Mail className="w-4 h-4" />
            <span>SEND AN EMAIL</span>
          </a>

          <button
            onClick={copyEmail}
            className="inline-flex items-center gap-3 px-6 py-5 border border-[#1F1F1F]/20 dark:border-white/20 hover:border-[#FF4D2D] dark:hover:border-[#FF4D2D] transition-colors font-mono text-xs md:text-sm uppercase tracking-widest text-[#111111] dark:text-[#F5F5F5] rounded-none bg-transparent"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span>COPIED TO CLIPBOARD</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#666666] dark:text-[#888888]" />
                <span>COPY ADDRESS</span>
              </>
            )}
          </button>
        </div>

        {/* Minimal Social Links */}
        <div className="flex flex-wrap items-center gap-6 md:gap-8 text-xs font-mono uppercase tracking-widest">
          <a
            href={PERSONAL_INFO.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 hover:text-[#FF4D2D] transition-colors"
          >
            <span>GITHUB</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          <a
            href={PERSONAL_INFO.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 hover:text-[#FF4D2D] transition-colors"
          >
            <span>LINKEDIN</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          <a
            href={PERSONAL_INFO.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 hover:text-[#FF4D2D] transition-colors"
          >
            <span>TWITTER</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          <a
            href={PERSONAL_INFO.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 hover:text-[#FF4D2D] transition-colors"
          >
            <span>INSTAGRAM</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

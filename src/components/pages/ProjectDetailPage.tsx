import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PROJECTS } from '../../data/portfolioData';
import { ArrowLeft, ArrowUpRight, Code, ExternalLink } from 'lucide-react';
import { Footer } from '../layout/Footer';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = PROJECTS.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 max-w-7xl mx-auto text-center">
        <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight uppercase">
          PROJECT CASE STUDY NOT FOUND
        </h1>
        <p className="text-sm font-mono uppercase tracking-widest text-[#666666] dark:text-[#888888]">
          THE REQUESTED ROUTE DOES NOT EXIST IN THIS PORTFOLIO EDITION.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-3 px-6 py-3 bg-[#111111] dark:bg-[#F5F5F5] text-[#FAFAFA] dark:text-[#111111] font-mono text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO INDEX</span>
        </button>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen pt-28 md:pt-36 animate-fade-in overflow-hidden">
      {/* Top Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-8 border-b border-[#1F1F1F]/10 dark:border-white/10 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#666666] dark:text-[#888888]">
        <Link
          to="/"
          className="inline-flex items-center gap-2 hover:text-[#FF4D2D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ALL CASE STUDIES</span>
        </Link>
        <span>{project.number} // {project.category}</span>
      </div>

      {/* Hero Header */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-5xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF4D2D] block mb-4">
            ARCHITECTURE CASE STUDY // {project.year}
          </span>
          <h1 className="font-display font-extrabold text-5xl sm:text-7xl md:text-9xl leading-[0.88] tracking-tighter uppercase text-[#111111] dark:text-[#F5F5F5] mb-6">
            {project.title}
          </h1>
          <p className="text-lg md:text-3xl font-light text-[#666666] dark:text-[#888888]">
            {project.subtitle}
          </p>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-6 mt-10">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-4 bg-[#111111] dark:bg-[#F5F5F5] text-[#FAFAFA] dark:text-[#111111] font-mono text-xs uppercase tracking-widest hover:bg-[#FF4D2D] dark:hover:bg-[#FF4D2D] dark:hover:text-white transition-all duration-300"
              >
                <Code className="w-4 h-4" />
                <span>VIEW REPOSITORY</span>
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-4 border border-[#1F1F1F]/20 dark:border-white/20 font-mono text-xs uppercase tracking-widest text-[#111111] dark:text-[#F5F5F5] hover:border-[#FF4D2D] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>LIVE DEMONSTRATION</span>
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="editorial-divider max-w-7xl mx-auto" />

      {/* Case Study Grid Content: Overview, Problem & Architecture */}
      <section className="py-20 md:py-32 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column (4 cols): Metadata & Tech Stack */}
          <div className="lg:col-span-4 flex flex-col gap-10 lg:sticky lg:top-32">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#666666] dark:text-[#888888] block mb-3">
                TECH STACK & TOOLS
              </span>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 bg-[#111111]/5 dark:bg-white/5 border border-[#1F1F1F]/10 dark:border-white/10 text-[#111111] dark:text-[#F5F5F5]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#666666] dark:text-[#888888] block mb-2">
                DOMAIN / TYPE
              </span>
              <p className="font-display font-medium text-lg text-[#111111] dark:text-[#F5F5F5]">
                {project.category}
              </p>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#666666] dark:text-[#888888] block mb-2">
                YEAR COMPLETED
              </span>
              <p className="font-display font-medium text-lg text-[#111111] dark:text-[#F5F5F5]">
                {project.year}
              </p>
            </div>
          </div>

          {/* Right Column (8 cols): Deep Technical Breakdown */}
          <div className="lg:col-span-8 flex flex-col gap-16">
            {/* Overview & Problem */}
            <div>
              <h2 className="font-display font-bold text-3xl md:text-5xl uppercase tracking-tight text-[#111111] dark:text-[#F5F5F5] mb-6">
                01 // PROBLEM STATEMENT
              </h2>
              <p className="text-base md:text-xl font-light leading-relaxed text-[#111111] dark:text-[#F5F5F5] mb-4">
                {project.summary}
              </p>
              <p className="text-base md:text-lg font-light leading-relaxed text-[#666666] dark:text-[#888888]">
                {project.problem}
              </p>
            </div>

            {/* Architecture & Design Decisions */}
            <div className="pt-12 border-t border-[#1F1F1F]/10 dark:border-white/10">
              <h2 className="font-display font-bold text-3xl md:text-5xl uppercase tracking-tight text-[#111111] dark:text-[#F5F5F5] mb-6">
                02 // SYSTEM ARCHITECTURE
              </h2>
              <p className="text-base md:text-lg font-light leading-relaxed text-[#111111] dark:text-[#F5F5F5] mb-8">
                {project.architecture}
              </p>

              <div className="flex flex-col gap-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#FF4D2D]">
                  ARCHITECTURAL HIGHLIGHTS
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.architectureHighlights.map((highlight, index) => (
                    <li
                      key={index}
                      className="p-5 border border-[#1F1F1F]/10 dark:border-white/10 bg-[#111111]/[0.02] dark:bg-white/[0.02] text-sm font-light text-[#111111] dark:text-[#F5F5F5] flex items-start gap-3"
                    >
                      <span className="font-mono text-xs text-[#FF4D2D]">0{index + 1}</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Features Implemented */}
            <div className="pt-12 border-t border-[#1F1F1F]/10 dark:border-white/10">
              <h2 className="font-display font-bold text-3xl md:text-5xl uppercase tracking-tight text-[#111111] dark:text-[#F5F5F5] mb-6">
                03 // KEY FEATURES
              </h2>
              <ul className="flex flex-col divide-y divide-[#1F1F1F]/10 dark:divide-white/10">
                {project.features.map((feature, idx) => (
                  <li key={idx} className="py-4 flex items-center justify-between">
                    <span className="text-sm md:text-base font-light text-[#111111] dark:text-[#F5F5F5]">
                      {feature}
                    </span>
                    <span className="font-mono text-xs text-[#666666] dark:text-[#888888]">
                      VERIFIED
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Challenges & Learnings */}
            <div className="pt-12 border-t border-[#1F1F1F]/10 dark:border-white/10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h3 className="font-display font-bold text-xl md:text-2xl uppercase tracking-tight text-[#111111] dark:text-[#F5F5F5] mb-4">
                  ENGINEERING CHALLENGES
                </h3>
                <ul className="flex flex-col gap-3">
                  {project.challenges.map((challenge, idx) => (
                    <li key={idx} className="text-sm font-light text-[#666666] dark:text-[#888888] flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-[#FF4D2D] rounded-full mt-2 shrink-0" />
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-display font-bold text-xl md:text-2xl uppercase tracking-tight text-[#111111] dark:text-[#F5F5F5] mb-4">
                  KEY LEARNINGS
                </h3>
                <ul className="flex flex-col gap-3">
                  {project.learnings.map((learning, idx) => (
                    <li key={idx} className="text-sm font-light text-[#666666] dark:text-[#888888] flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-[#FF4D2D] rounded-full mt-2 shrink-0" />
                      <span>{learning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Editorial Navigation to Other Projects */}
      <section className="py-16 border-t border-[#1F1F1F]/10 dark:border-white/10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <Link
            to="/"
            className="group inline-flex items-center gap-3 text-sm font-mono uppercase tracking-widest text-[#111111] dark:text-[#F5F5F5] hover:text-[#FF4D2D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>RETURN TO ALL CASE STUDIES</span>
          </Link>
          <span className="text-xs font-mono text-[#666666] dark:text-[#888888] uppercase">
            SWASTIK // ENGINEERING CASE STUDY
          </span>
        </div>
      </section>

      <Footer />
    </main>
  );
};

import React from 'react';
import { HeroSection } from '../sections/HeroSection';
import { WorkSection } from '../sections/WorkSection';
import { BackgroundSection } from '../sections/BackgroundSection';
import { SkillsSection } from '../sections/SkillsSection';
import { AboutSection } from '../sections/AboutSection';
import { ContactSection } from '../sections/ContactSection';
import { Footer } from '../layout/Footer';

export const HomePage: React.FC = () => {
  return (
    <main className="w-full overflow-hidden animate-fade-in">
      <HeroSection />
      <div className="editorial-divider max-w-7xl mx-auto" />
      <WorkSection />
      <div className="editorial-divider max-w-7xl mx-auto" />
      <BackgroundSection />
      <div className="editorial-divider max-w-7xl mx-auto" />
      <SkillsSection />
      <div className="editorial-divider max-w-7xl mx-auto" />
      <AboutSection />
      <div className="editorial-divider max-w-7xl mx-auto" />
      <ContactSection />
      <Footer />
    </main>
  );
};

import React from 'react';
import { HeroSection } from '../sections/HeroSection';
import { WorkSection } from '../sections/WorkSection';
import { AboutSection } from '../sections/AboutSection';
import { SkillsSection } from '../sections/SkillsSection';
import { BackgroundSection } from '../sections/BackgroundSection';
import { ContactSection } from '../sections/ContactSection';
import { Footer } from '../layout/Footer';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const HomePage: React.FC = () => {
  useDocumentTitle(
    undefined,
    'Swastik Singh — Computer Science and Engineering student building backend-heavy systems: VulnTrack, Tenora and an AI Interview Platform, written up as engineering case studies.',
  );

  return (
    <>
      <main id="main" tabIndex={-1} className="outline-none">
        <HeroSection />
        <WorkSection />
        <AboutSection />
        <SkillsSection />
        <BackgroundSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
};

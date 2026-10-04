import React from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useSite } from '../../context/site';
import { InstrumentProvider } from '../../lib/instrument/InstrumentProvider';
import { Hero } from '../home/Hero';
import { MechanismMarquee, Stage } from '../home/Stage';
import { WorkExplorer } from '../home/WorkExplorer';
import { SecondTime } from '../home/SecondTime';
import { History } from '../home/History';
import { About } from '../home/About';
import { Contact } from '../home/Contact';
import { SiteFooter } from '../layout/SiteFooter';

/**
 * Home tells one story: the claim with its proof running, a dive into the
 * system, the second time happening to each project, the four systems to
 * explore, the record of building them, who built them, and a way to write.
 * The depth lives on each project's case-study page.
 */
export const HomePage: React.FC = () => {
  useDocumentTitle();
  const { reducedMotion } = useSite();

  return (
    <InstrumentProvider reducedMotion={reducedMotion}>
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Stage>
          <SecondTime />
          <MechanismMarquee />
          <WorkExplorer />
          <History />
        </Stage>
        <About />
        <Contact />
      </main>
      <SiteFooter />
    </InstrumentProvider>
  );
};

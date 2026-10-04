import React from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useSite } from '../../context/site';
import { InstrumentProvider } from '../../lib/instrument/InstrumentProvider';
import { Hero } from '../home/Hero';
import { MechanismMarquee, Stage } from '../home/Stage';
import { WorkExplorer } from '../home/WorkExplorer';
import { SecondTime } from '../home/SecondTime';
import { History } from '../home/History';
import { ScrollStatus } from '../home/ScrollStatus';
import { ReelChapter } from '../reels/ReelChapter';
import { About } from '../home/About';
import { Contact } from '../home/Contact';
import { SiteFooter } from '../layout/SiteFooter';

/**
 * Home tells one story: the claim with its proof running, a dive into the
 * system, the second time happening to each project, the four systems to
 * explore, the record of building them, then the other craft (swastik.mov:
 * the reels, as an edit), who made all of it, and a way to write.
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
          {/* Pinned sections each get a wrapper React owns: GSAP's pin spacers then never
              move a node React is about to insert next to (the explorer swaps to a list
              when WebGL fails). */}
          <div>
            <SecondTime />
          </div>
          <MechanismMarquee />
          <div>
            <WorkExplorer />
          </div>
          <div>
            <History />
          </div>
        </Stage>
        <ReelChapter />
        <About />
        <Contact />
      </main>
      <SiteFooter />
      <ScrollStatus />
    </InstrumentProvider>
  );
};

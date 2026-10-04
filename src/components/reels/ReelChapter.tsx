import React from 'react';
import { Stage } from '../home/Stage';
import { ReelPlayerProvider } from './ReelPlayer';
import { TheCut } from './TheCut';
import { EditSuite } from './EditSuite';
import { TopReels } from './TopReels';
import { OneCalendar } from './OneCalendar';

/**
 * swastik.mov: the second craft. It opens on the cut from "works once" to the
 * camera, lays every post out as an edit, sizes the ten most watched by their
 * views, and closes on one calendar holding both crafts.
 */
export const ReelChapter: React.FC = () => (
  <ReelPlayerProvider>
    <Stage className="reel grain">
      {/* Pinned sections each get their own wrapper (see HomePage). */}
      <div>
        <TheCut />
      </div>
      <div>
        <EditSuite />
      </div>
      <TopReels />
      <OneCalendar />
    </Stage>
  </ReelPlayerProvider>
);

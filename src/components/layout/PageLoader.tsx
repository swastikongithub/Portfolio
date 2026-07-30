import React, { useState, useEffect } from 'react';

interface PageLoaderProps {
  onComplete: () => void;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 350);
    const t2 = setTimeout(() => setStep(2), 750);
    const t3 = setTimeout(() => setFading(true), 1150);
    const t4 = setTimeout(() => onComplete(), 1550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A] text-[#111111] dark:text-[#F5F5F5] transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Massive Typography Name */}
        <div className="font-display font-extrabold text-4xl sm:text-6xl md:text-8xl tracking-tighter uppercase overflow-hidden">
          <span className="inline-block animate-fade-in">SWASTIK</span>
        </div>

        {/* Minimal Swiss Editorial Counter / State */}
        <div className="flex items-center gap-3 text-xs md:text-sm font-mono tracking-widest uppercase text-[#666666] dark:text-[#888888]">
          <span>{step === 0 ? '001 // INITIALIZING' : step === 1 ? '002 // SYSTEM ARCHITECTURE' : '003 // PORTFOLIO READY'}</span>
          <span className="w-1.5 h-1.5 bg-[#FF4D2D] rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

import React, { useRef } from 'react';
import { CERTIFICATIONS, EDUCATION, TRAINING } from '../../data/portfolioData';
import { useReveal } from '../../hooks/useReveal';
import { SectionHead } from '../ui/SectionHead';

/** Education, training and certifications as a ledger — deliberately quieter than the work. */
export const BackgroundSection: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section id="record" ref={root} aria-labelledby="record-title" className="frame pb-24 md:pb-36">
      <SectionHead id="record" number="04" kicker="Record" lines={['Education', ['& training.', 't-serif normal-case !font-normal !tracking-[-0.01em]']]} />

      <h3 className="t-label text-muted mb-3">Education</h3>
      <ol className="border-t-2 border-ink">
        {EDUCATION.map((e, i) => (
          <li key={e.institution} className="grid-12 gap-y-2 border-b border-rule py-6 md:py-8" data-reveal>
            <p className="col-span-4 md:col-span-3 t-label text-muted pt-1.5">{e.period}</p>
            <div className="col-span-4 md:col-span-6">
              <p className={i === 0 ? 't-head' : 'text-[1.3rem] font-[650] [font-stretch:85%] leading-tight'}>{e.institution}</p>
              <p className="mt-1.5 text-muted">
                {e.qualification} · {e.place}
              </p>
            </div>
            {e.result && (
              <p className="col-span-4 md:col-span-3 md:text-right font-mono text-[0.95rem] pt-1">{e.result}</p>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-16 grid-12 gap-y-12">
        <div className="col-span-4 md:col-span-5" data-reveal>
          <h3 className="t-label text-muted mb-3">Training</h3>
          {TRAINING.map((t) => (
            <div key={t.title} className="border-t-2 border-ink pt-5">
              <p className="t-label text-muted">{t.date}</p>
              <p className="mt-2 text-[1.3rem] font-[650] [font-stretch:85%] leading-tight">
                {t.title} <span className="text-muted font-[450]">— {t.issuer}</span>
              </p>
              {t.note && <p className="mt-3 t-body text-muted">{t.note}</p>}
            </div>
          ))}
        </div>

        <div className="col-span-4 md:col-span-6 md:col-start-7" data-reveal>
          <h3 className="t-label text-muted mb-3">Certifications</h3>
          <ul className="border-t-2 border-ink">
            {CERTIFICATIONS.map((c) => (
              <li key={c.title} className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-rule py-3.5">
                <span className="t-label text-muted pt-0.5">{c.date}</span>
                <span className="text-[0.98rem] font-[520]">
                  {c.title}
                  {c.issuer && <span className="text-muted font-[400]"> — {c.issuer}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

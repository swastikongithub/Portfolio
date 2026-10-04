import React, { useRef, useState } from 'react';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { useReveal } from '../../hooks/useReveal';
import { MOTION_OK, gsap, useGSAP } from '../../lib/motion';

const LINKS: [label: string, href: string, handle: string][] = [
  ['GitHub', PERSONAL_INFO.github, PERSONAL_INFO.githubHandle],
  ['LinkedIn', PERSONAL_INFO.linkedin, PERSONAL_INFO.linkedinHandle],
  ['Instagram', PERSONAL_INFO.instagram, PERSONAL_INFO.instagramHandle],
];

/** One way to write, and the profiles. */
export const Contact: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState('');
  useReveal(root);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '[data-letter]',
          { yPercent: 120, rotate: 10 },
          { yPercent: 0, rotate: 0, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top 25%', scrub: 0.6 } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const copy = () => {
    navigator.clipboard
      ?.writeText(PERSONAL_INFO.email)
      .then(() => setCopied('Copied. Paste it wherever you write email.'))
      .catch(() => setCopied(`Copy failed. The address is ${PERSONAL_INFO.email}`));
  };

  return (
    <section ref={root} id="contact" aria-labelledby="contact-title" className="relative border-t border-line-2 pt-[clamp(72px,10vw,150px)]">
      <div className="frame">
        <h2
          id="contact-title"
          tabIndex={-1}
          className="font-[800] leading-[0.85] tracking-[-0.055em] text-[clamp(3.6rem,15vw,17rem)] outline-none"
        >
          <span className="sr-only">Write to me.</span>
          <span aria-hidden="true" className="block overflow-hidden pb-[0.06em]">
            {'Write to me'.split('').map((c, i) => (
              <span key={i} data-letter className="inline-block will-change-transform">
                {c === ' ' ? ' ' : c}
              </span>
            ))}
            <span data-letter className="ml-[0.03em] inline-block h-[0.19em] w-[0.19em] rounded-[0.03em] bg-signal align-baseline" />
          </span>
        </h2>

        <div className="grid-12 mt-[clamp(32px,5vw,64px)] gap-y-10">
          <div className="col-span-4 md:col-span-12 lg:col-span-8">
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              className="group inline-block break-all font-[700] tracking-[-0.03em] text-[clamp(1.5rem,4.6vw,4rem)] leading-[1.05]"
              data-reveal
            >
              <span className="bg-[linear-gradient(var(--signal),var(--signal))] bg-[length:0%_0.14em] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-[var(--ease-out)] group-hover:bg-[length:100%_0.14em] group-focus-visible:bg-[length:100%_0.14em]">
                {PERSONAL_INFO.email}
              </span>
            </a>
            <p className="t-body mt-5 max-w-[52ch] text-ink-2" data-reveal>
              It opens your mail app: no form, and your message gets processed exactly once.{' '}
              <button type="button" onClick={copy} className="link text-ink">
                Copy the address instead
              </button>
              .
            </p>
            <p className="t-small mt-2 min-h-[1.55em] text-ink" role="status" aria-live="polite">
              {copied}
            </p>
          </div>

          <div className="col-span-4 md:col-span-12 lg:col-span-3 lg:col-start-10">
            <ul className="border-t border-line-2">
              {LINKS.map(([label, href, handle]) => (
                <li key={label} className="border-b border-line-2" data-reveal>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="group flex items-baseline justify-between gap-4 py-3.5" data-magnetic>
                    <span className="font-[650]">{label}</span>
                    <span className="t-mono text-ink-2 transition-colors group-hover:text-ink">
                      {handle} <span aria-hidden="true">↗</span>
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
              <li className="border-b border-line-2" data-reveal>
                <a href={PERSONAL_INFO.resume} target="_blank" rel="noopener noreferrer" className="group flex items-baseline justify-between gap-4 py-3.5">
                  <span className="font-[650]">Résumé</span>
                  <span className="t-mono text-ink-2 transition-colors group-hover:text-ink">
                    PDF, {PERSONAL_INFO.resumeUpdated} <span aria-hidden="true">↗</span>
                  </span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </section>
  );
};

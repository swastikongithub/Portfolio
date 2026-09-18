import React, { useRef } from 'react';
import { EASE, MOTION_OK, gsap, useGSAP } from '../../lib/motion';

interface EditorialImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  className?: string;
}

/**
 * A printed-plate photograph: monochrome by default (colour returns on hover),
 * revealed with a wipe and a slow counter-scale when motion is allowed.
 * Explicit dimensions prevent layout shift; the image is lazy-loaded.
 */
export const EditorialImage: React.FC<EditorialImageProps> = ({ src, alt, width, height, caption, className = '' }) => {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const frame = root.current?.querySelector('[data-plate]');
        const img = root.current?.querySelector('img');
        if (!frame || !img) return;
        gsap.fromTo(
          frame,
          { clipPath: 'inset(100% 0 0 0)' },
          { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: EASE.press, scrollTrigger: { trigger: root.current, start: 'top 80%', once: true } },
        );
        gsap.fromTo(
          img,
          { scale: 1.18 },
          { scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <figure ref={root} className={className}>
      <div data-plate className="group relative overflow-hidden bg-paper-2">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="h-auto w-full object-cover grayscale contrast-[1.08] transition-[filter] duration-700 group-hover:grayscale-0"
        />
        <span className="pointer-events-none absolute inset-0 border border-rule" aria-hidden="true" />
      </div>
      {caption && (
        <figcaption className="mt-3 flex gap-3 text-[0.9rem] text-muted">
          <span className="t-label text-ink shrink-0">Fig.</span>
          <span className="t-serif italic text-[1rem]">{caption}</span>
        </figcaption>
      )}
    </figure>
  );
};

import React from 'react';

interface EditorialImageProps {
  src: string;
  alt: string;
  className?: string;
  badge?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'wide';
}

export const EditorialImage: React.FC<EditorialImageProps> = ({
  src,
  alt,
  className = '',
  badge,
  aspectRatio = 'portrait'
}) => {
  const ratioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    wide: 'aspect-[16/9]'
  };

  return (
    <div className={`relative overflow-hidden group bg-[#1F1F1F]/10 dark:bg-[#1F1F1F]/40 ${ratioClasses[aspectRatio]} ${className}`}>
      {/* High-contrast Black & White Photography with Subtle Zoom on Hover */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover grayscale contrast-125 brightness-95 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
      />

      {/* Subtle Orange Accent Overlay on Hover */}
      <div className="absolute inset-0 bg-[#FF4D2D]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Optional Swiss Editorial Corner Badge */}
      {badge && (
        <div className="absolute top-4 left-4 z-10 bg-[#111111] dark:bg-[#FAFAFA] text-[#FAFAFA] dark:text-[#111111] px-3 py-1 text-xs font-mono tracking-widest uppercase">
          {badge}
        </div>
      )}

      {/* Thin Editorial Frame Border */}
      <div className="absolute inset-0 border border-[#1F1F1F]/20 dark:border-white/10 pointer-events-none" />
    </div>
  );
};

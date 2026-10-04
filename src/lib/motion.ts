import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { TextPlugin } from 'gsap/TextPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, TextPlugin, MotionPathPlugin, useGSAP);

/**
 * Shared motion vocabulary. Entrances ease out hard (nothing ease-in on UI);
 * things that move across the screen ease in-out; scroll-linked motion is
 * linear and scrubbed. Nothing loops.
 */
export const EASE = {
  out: 'expo.out',
  move: 'expo.inOut',
  soft: 'power3.out',
} as const;

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger, useGSAP };

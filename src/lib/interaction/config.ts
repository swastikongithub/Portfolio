/**
 * The interaction language, in one place.
 *
 * Every pointer and touch behaviour on the site reads its numbers from here:
 * the pointer field (input), the instrument (WebGL response) and the DOM
 * responses (magnetic controls, proximity, impact labels). Tune here, not in
 * components. World units are the instrument's (the z = 0 plane is about 12.6
 * units tall at any viewport height).
 */
export const INTERACTION = {
  /** Rendering quality per device class. */
  quality: {
    desktop: { dprMax: 2, membraneSegments: 96, antialias: true },
    mobile: { dprMax: 1.5, membraneSegments: 48, antialias: false },
  },

  /** Raw input shaping. */
  pointer: {
    /** Position smoothing per 60 fps frame (0 = frozen, 1 = raw). */
    smoothing: 0.22,
    /** Velocity smoothing per 60 fps frame. */
    velocitySmoothing: 0.18,
    /** No movement for this long and the field returns to rest. */
    restAfterMs: 900,
    /** Speeds above this (px/s) are treated as this. */
    maxSpeed: 2600,
    /** Below this speed (px/s) the pointer only presses; above it, it leaves a wake. */
    wakeSpeed: 650,
    /** How strongly the field acts while the pointer is over a link or button (quiet: the control wins). */
    focusStrength: 0.2,
  },

  /** The membrane: the constraint surface, as a material. */
  membrane: {
    /** A slow pointer presses a dimple into the surface. */
    dimpleDepth: 0.2,
    dimpleRadius: 0.75,
    /** A fast pointer drags a short directional wake behind it. */
    wakeAmplitude: 0.11,
    wakeFrequency: 6.5,
    wakeLength: 1.4,
    /** Impulse ripples by kind: a click, a double click, a stampede source, a system transition. */
    ripple: {
      click: { amplitude: 0.32, frequency: 7, speed: 3.4, decay: 1.7 },
      shock: { amplitude: 0.5, frequency: 4.5, speed: 5.6, decay: 2.3 },
      soft: { amplitude: 0.2, frequency: 9, speed: 2.4, decay: 1.4 },
    },
  },

  /** Agents near the pointer get pushed and settle back. */
  agents: {
    influenceRadius: 2.1,
    /** Push per second at the centre of the field, scaled by pointer speed. */
    repel: 3.2,
    /** Extra push while dragging, along the drag. */
    dragForce: 0.0028,
    /** Outward kick from a click, at the impact point. */
    impulse: 1.6,
    impulseRadius: 2.6,
    /** Offset retained per 60 fps frame: higher feels heavier, slower to settle. */
    viscosity: 0.9,
  },

  /** Discrete events. */
  impulses: {
    /** Two clicks within this window are a "double". */
    doubleMs: 320,
    /** This many clicks within the window is a stampede (rare on purpose). */
    stampedeClicks: 4,
    stampedeMs: 1300,
    /** A second click within this window counts as the same event / the same file again. */
    sameEventMs: 750,
    /** Taps hit a little softer than clicks. */
    touchScale: 0.8,
  },

  /** Controls that lean toward the pointer. */
  magnetic: {
    /** Fraction of the pointer's offset from the centre the control follows. */
    strength: 0.22,
    maxShift: 7,
    /** Distance (px) at which project navigation starts to anticipate the pointer. */
    proximity: 110,
  },

  /** The cursor: a request reticle (fine pointers, motion allowed). */
  cursor: {
    /** Ring follow per 60 fps frame (the dot is never smoothed). */
    ringSmoothing: 0.2,
    /** Stretch along velocity at full speed (fraction of its size). */
    stretch: 0.55,
    /** Padding (px) around a control when the ring locks onto it. */
    lockPadding: 8,
  },

  /** Impact labels ("23P01", "404", "stored"…). */
  labels: {
    lifetimeMs: 1500,
    /** One answer at a time: a new outcome replaces the last. */
    max: 1,
  },
} as const;

export type Quality = (typeof INTERACTION.quality)['desktop'];

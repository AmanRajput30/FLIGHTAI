import { Variants, Easing } from 'framer-motion';

// Standardized animation timings as per Rule 87
export const timing = {
  instant: 0.1,
  fast: 0.16,
  normal: 0.24,
  panel: 0.32,
  modal: 0.28,
  page: 0.4,
};

// Easing presets
export const easing = {
  standard: [0.4, 0.0, 0.2, 1] as Easing, // ease-out
  accelerate: [0.4, 0.0, 1, 1] as Easing, // ease-in
  decelerate: [0.0, 0.0, 0.2, 1] as Easing, // ease-out (smooth entrance)
  spring: { type: 'spring', stiffness: 300, damping: 30 } as any,
};

// Common variants
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: timing.normal, ease: easing.decelerate } },
  exit: { opacity: 0, transition: { duration: timing.fast, ease: easing.accelerate } },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: timing.normal, ease: easing.decelerate } },
  exit: { opacity: 0, y: 10, transition: { duration: timing.fast, ease: easing.accelerate } },
};

export const slideLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: timing.panel, ease: easing.decelerate } },
  exit: { opacity: 0, x: -20, transition: { duration: timing.fast, ease: easing.accelerate } },
};

export const slideRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: timing.panel, ease: easing.decelerate } },
  exit: { opacity: 0, x: 20, transition: { duration: timing.fast, ease: easing.accelerate } },
};

export const panelOpen: Variants = {
  initial: { opacity: 0, width: 0 },
  animate: { opacity: 1, width: 'auto', transition: { duration: timing.panel, ease: easing.decelerate } },
  exit: { opacity: 0, width: 0, transition: { duration: timing.fast, ease: easing.accelerate } },
};

export const modalTransition: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: timing.modal, ease: easing.decelerate } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: timing.fast, ease: easing.accelerate } },
};

export const staggerChildren = (staggerTime = 0.05): Variants => ({
  animate: {
    transition: {
      staggerChildren: staggerTime,
    },
  },
});

export const M_PRESETS = {
  panel: { duration: timing.panel, ease: easing.decelerate },
  modal: { duration: timing.modal, ease: easing.decelerate },
};

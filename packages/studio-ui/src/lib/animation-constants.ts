/**
 * Animation constants based on sacred geometry principles.
 * Centralizes timing, easing, and golden ratio values.
 */

// Golden ratio constants
export const PHI = 1.618033988749;
export const PHI_INVERSE = 1 / PHI; // 0.618...

// Sacred timing (based on phi and significant numbers)
export const TIMING = {
  fast: 0.3,
  normal: 0.618, // Golden ratio
  slow: 1.0,
  breath: 4.0, // Ambient loops
  emergence: 1.2, // Hero emergence
  rotation: 120, // Full cycle (existing)
} as const;

// Easing curves
// Golden ratio easing - balanced entry/exit based on phi
export const EASE_PHI: [number, number, number, number] = [0.618, 0, 0.382, 1];

// Emergence easing - smooth reveal for hero elements
export const EASE_EMERGENCE: [number, number, number, number] = [0.36, 0, 0.66, 1];

// Standard easing - widely used ease-out curve for UI transitions
export const EASE_STANDARD: [number, number, number, number] = [
  0.25, 0.46, 0.45, 0.94,
];

// Toggle transition variants for collective/personal mode switching
export const TOGGLE_VARIANTS = {
  badge: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.25, ease: EASE_STANDARD },
  },
  overlay: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: EASE_PHI },
  },
  cell: {
    initial: { opacity: 0, y: 16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.35, ease: EASE_EMERGENCE },
  },
  crossfade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: EASE_STANDARD },
  },
} as const;

// Orchestration timing for hub page entrance sequence
export const ORCHESTRATION = {
  headerDelay: 0,
  pulseDelay: 0.2,
  panelStagger: 0.06,
  panelDelay: 0.35,
  glowActivation: 0.8,
  glowFadeDuration: 1.0,
} as const;

// Glow easing — smooth fade-in/out for ambient elements
export const EASE_GLOW: [number, number, number, number] = [0.4, 0, 0.2, 1];

"use client";

import type { ReactNode } from "react";
import { motion, MotionConfig } from "motion/react";

import { EASE_EMERGENCE, EASE_STANDARD } from "./lib/animation-constants";

// ---------------------------------------------------------------------------
// HubStagger — orchestrates staggered entrance for children
// ---------------------------------------------------------------------------

interface HubStaggerProps {
  children: ReactNode;
  className?: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export function HubStagger({ children, className }: HubStaggerProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

// ---------------------------------------------------------------------------
// HubStaggerItem — individual staggered element
// ---------------------------------------------------------------------------

interface HubStaggerItemProps {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "panel";
}

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: EASE_STANDARD },
  },
};

const panelVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_STANDARD },
  },
};

export function HubStaggerItem({
  children,
  className,
  variant = "panel",
}: HubStaggerItemProps) {
  return (
    <motion.div
      variants={variant === "fade" ? fadeVariants : panelVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// HubAmbientGlow — breathing gold glow behind the top of the page
// ---------------------------------------------------------------------------

interface HubAmbientGlowProps {
  className?: string;
}

export function HubAmbientGlow({ className }: HubAmbientGlowProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE_EMERGENCE }}
      className={className}
    >
      <motion.div
        animate={{ opacity: [0.03, 0.05, 0.03] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="h-full w-full rounded-full bg-[var(--color-gold)]"
      />
    </motion.div>
  );
}

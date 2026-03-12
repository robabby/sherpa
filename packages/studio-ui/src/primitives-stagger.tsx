"use client";

import type { ReactNode } from "react";
import { motion, MotionConfig } from "motion/react";

import { EASE_STANDARD } from "./lib/animation-constants";

// ---------------------------------------------------------------------------
// PrimitivesStagger — orchestrates staggered entrance for catalog sections
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

interface PrimitivesStaggerProps {
  children: ReactNode;
  className?: string;
}

export function PrimitivesStagger({ children, className }: PrimitivesStaggerProps) {
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
// PrimitivesStaggerItem — individual staggered section
// ---------------------------------------------------------------------------

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_STANDARD },
  },
};

interface PrimitivesStaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function PrimitivesStaggerItem({ children, className }: PrimitivesStaggerItemProps) {
  return (
    <motion.div variants={sectionVariants} className={className}>
      {children}
    </motion.div>
  );
}

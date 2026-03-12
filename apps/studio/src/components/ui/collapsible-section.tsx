"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePersistedState } from "@/hooks/use-persisted-state";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./collapsible";

interface CollapsibleSectionProps {
  /** Unique storage key for persisting expand state */
  storageKey: string;
  /** Section title */
  title: string;
  /** Whether section starts expanded (default: false) */
  defaultExpanded?: boolean;
  /** Section content */
  children: React.ReactNode;
  /** Additional class name for container */
  className?: string;
  /** Additional class name for content wrapper */
  contentClassName?: string;
}

/**
 * Progressive disclosure wrapper for non-essential sections.
 *
 * Features:
 * - Smooth expand/collapse animation
 * - Persists state in localStorage
 * - Consistent header styling
 *
 * Design principle: "Quiet Confidence" — unobtrusive collapse,
 * content available on demand without clutter.
 */
export function CollapsibleSection({
  storageKey,
  title,
  defaultExpanded = false,
  children,
  className,
  contentClassName,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = usePersistedState(storageKey, defaultExpanded);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <section className={className}>
        <CollapsibleTrigger
          className={cn(
            "group/trigger flex w-full items-center justify-between py-3",
            "border-t border-[var(--border-gold)]/15",
            "text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground/50",
            "transition-colors hover:text-[var(--color-gold)]/70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          <span className="flex items-center gap-3">
            <span>{title}</span>
            <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-gold)]/20 to-transparent" aria-hidden="true" />
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="group-hover/trigger:text-[var(--color-gold)]/50"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
        </CollapsibleTrigger>

        <AnimatePresence initial={false}>
          {isOpen && (
            <CollapsibleContent forceMount asChild>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div className={cn("pt-3", contentClassName)}>{children}</div>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </section>
    </Collapsible>
  );
}

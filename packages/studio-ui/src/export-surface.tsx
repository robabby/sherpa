"use client";

import { useState } from "react";

import { cn } from "./lib/utils";
import type { ExportSignature } from "@/lib/studio";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { KindBadge } from "./kind-badge";
import { TypeDetailPanel } from "./type-detail-panel";

const MAX_VISIBLE = 12;

interface ExportSurfaceProps {
  keyExports: string[];
  detectedExports: string[];
  detectedTypes: string[];
  signatures?: Record<string, ExportSignature>;
  isGold?: boolean;
}

function findSignature(
  name: string,
  sigs: Record<string, ExportSignature>,
): ExportSignature | undefined {
  return sigs[name] ?? sigs[name.replace(/^\* from .*$/, "")];
}

export function ExportSurface({
  keyExports,
  detectedExports,
  detectedTypes,
  signatures,
  isGold = false,
}: ExportSurfaceProps) {
  const allNames = [
    ...keyExports,
    ...detectedExports.filter((e) => !keyExports.includes(e)),
    ...detectedTypes.filter(
      (t) => !keyExports.includes(t) && !detectedExports.includes(t),
    ),
  ];
  const defaultExport = keyExports[0] ?? detectedExports[0] ?? null;

  const [activeExport, setActiveExport] = useState<string | null>(
    defaultExport,
  );
  const [expanded, setExpanded] = useState(false);

  const hasOverflow = detectedExports.length > MAX_VISIBLE;
  const visibleExports = expanded
    ? detectedExports
    : detectedExports.slice(0, MAX_VISIBLE);

  const highlightColor = isGold
    ? "text-[var(--color-gold-bright)]"
    : "text-[var(--color-primitive-bright)]";

  const activeSig =
    activeExport && signatures
      ? (findSignature(activeExport, signatures) ?? null)
      : null;

  const keySet = new Set(keyExports);

  const hasSigs = signatures && Object.keys(signatures).length > 0;

  // ── Desktop: two-column with clickable list + panel ─────────────
  // ── Mobile: accordion with inline type detail ───────────────────

  if (!hasSigs) {
    return <FlatExportList {...{ keyExports, detectedExports, detectedTypes, visibleExports, hasOverflow, expanded, setExpanded, highlightColor, keySet }} />;
  }

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden lg:grid lg:grid-cols-[2fr_3fr] lg:gap-6">
        <DesktopExportList
          keyExports={keyExports}
          detectedExports={detectedExports}
          detectedTypes={detectedTypes}
          visibleExports={visibleExports}
          hasOverflow={hasOverflow}
          expanded={expanded}
          setExpanded={setExpanded}
          signatures={signatures}
          activeExport={activeExport}
          setActiveExport={setActiveExport}
          highlightColor={highlightColor}
          keySet={keySet}
          isGold={isGold}
        />
        <TypeDetailPanel
          signature={activeSig}
          isGold={isGold}
        />
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden">
        <MobileAccordion
          keyExports={keyExports}
          detectedExports={detectedExports}
          detectedTypes={detectedTypes}
          visibleExports={visibleExports}
          hasOverflow={hasOverflow}
          expanded={expanded}
          setExpanded={setExpanded}
          signatures={signatures}
          highlightColor={highlightColor}
          keySet={keySet}
          isGold={isGold}
          allNames={allNames}
        />
      </div>
    </>
  );
}

// ── Flat list (no signatures available) ──────────────────────────

function FlatExportList({
  keyExports,
  detectedExports,
  detectedTypes,
  visibleExports,
  hasOverflow,
  expanded,
  setExpanded,
  highlightColor,
  keySet,
}: {
  keyExports: string[];
  detectedExports: string[];
  detectedTypes: string[];
  visibleExports: string[];
  hasOverflow: boolean;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  highlightColor: string;
  keySet: Set<string>;
}) {
  return (
    <div className="space-y-4">
      {keyExports.length > 0 && (
        <div>
          <SectionHeader>Key Exports</SectionHeader>
          <div className="rounded-lg border border-[var(--border-primitive)]/15 bg-background/80 p-4">
            <div className="space-y-1 font-mono text-sm">
              {keyExports.map((exp) => (
                <div key={exp} className={highlightColor}>
                  {exp}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {detectedExports.length > 0 && (
        <div>
          <SectionHeader>All Exports ({detectedExports.length})</SectionHeader>
          <div className="rounded-lg border border-[var(--border-primitive)]/15 bg-background/80 p-4">
            <div className="space-y-0.5 font-mono text-xs">
              {visibleExports.map((exp) => (
                <div
                  key={exp}
                  className={cn(
                    keySet.has(exp)
                      ? highlightColor
                      : "text-muted-foreground/60",
                  )}
                >
                  {exp}
                </div>
              ))}
            </div>
            {hasOverflow && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 font-mono text-[10px] text-[var(--color-primitive)]/60 transition-colors hover:text-[var(--color-primitive)]"
              >
                {expanded
                  ? "Show less"
                  : `+ ${detectedExports.length - MAX_VISIBLE} more`}
              </button>
            )}
          </div>
        </div>
      )}

      {detectedTypes.length > 0 && (
        <div>
          <SectionHeader>
            Type Exports ({detectedTypes.length})
          </SectionHeader>
          <div className="rounded-lg border border-[var(--border-primitive)]/15 bg-background/80 p-4">
            <div className="space-y-0.5 font-mono text-xs italic text-muted-foreground/50">
              {detectedTypes.map((t) => (
                <div key={t}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Desktop clickable export list ────────────────────────────────

function DesktopExportList({
  keyExports,
  detectedExports,
  detectedTypes,
  visibleExports,
  hasOverflow,
  expanded,
  setExpanded,
  signatures,
  activeExport,
  setActiveExport,
  highlightColor,
  keySet,
  isGold,
}: {
  keyExports: string[];
  detectedExports: string[];
  detectedTypes: string[];
  visibleExports: string[];
  hasOverflow: boolean;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  signatures: Record<string, ExportSignature>;
  activeExport: string | null;
  setActiveExport: (name: string | null) => void;
  highlightColor: string;
  keySet: Set<string>;
  isGold: boolean;
}) {
  return (
    <div className="space-y-4">
      {keyExports.length > 0 && (
        <div>
          <SectionHeader>Key Exports</SectionHeader>
          <div className="rounded-lg border border-[var(--border-primitive)]/15 bg-background/80 p-1">
            {keyExports.map((exp) => (
              <ExportRow
                key={exp}
                name={exp}
                signature={findSignature(exp, signatures)}
                isActive={activeExport === exp}
                isKey
                isGold={isGold}
                highlightColor={highlightColor}
                onClick={() =>
                  setActiveExport(activeExport === exp ? null : exp)
                }
              />
            ))}
          </div>
        </div>
      )}

      {detectedExports.length > 0 && (
        <div>
          <SectionHeader>
            All Exports ({detectedExports.length})
          </SectionHeader>
          <div className="rounded-lg border border-[var(--border-primitive)]/15 bg-background/80 p-1">
            {visibleExports.map((exp) => (
              <ExportRow
                key={exp}
                name={exp}
                signature={findSignature(exp, signatures)}
                isActive={activeExport === exp}
                isKey={keySet.has(exp)}
                isGold={isGold}
                highlightColor={highlightColor}
                onClick={() =>
                  setActiveExport(activeExport === exp ? null : exp)
                }
              />
            ))}
            {hasOverflow && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 w-full px-3 py-1 text-left font-mono text-[10px] text-[var(--color-primitive)]/60 transition-colors hover:text-[var(--color-primitive)]"
              >
                {expanded
                  ? "Show less"
                  : `+ ${detectedExports.length - MAX_VISIBLE} more`}
              </button>
            )}
          </div>
        </div>
      )}

      {detectedTypes.length > 0 && (
        <div>
          <SectionHeader>
            Type Exports ({detectedTypes.length})
          </SectionHeader>
          <div className="rounded-lg border border-[var(--border-primitive)]/15 bg-background/80 p-1">
            {detectedTypes.map((t) => (
              <ExportRow
                key={t}
                name={t}
                signature={findSignature(t, signatures)}
                isActive={activeExport === t}
                isKey={false}
                isGold={isGold}
                highlightColor={highlightColor}
                onClick={() =>
                  setActiveExport(activeExport === t ? null : t)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Clickable export row ────────────────────────────────────────

function ExportRow({
  name,
  signature,
  isActive,
  isKey,
  isGold,
  highlightColor,
  onClick,
}: {
  name: string;
  signature?: ExportSignature;
  isActive: boolean;
  isKey: boolean;
  isGold: boolean;
  highlightColor: string;
  onClick: () => void;
}) {
  const activeBorderColor = isGold
    ? "border-l-[var(--color-gold-bright)]"
    : "border-l-[var(--color-primitive-bright)]";
  const activeBg = isGold
    ? "bg-[var(--color-gold)]/5"
    : "bg-[var(--color-primitive)]/5";

  return (
    <button
      role="option"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md border-l-2 border-l-transparent px-3 py-1.5 text-left font-mono text-xs transition-colors",
        "hover:bg-muted/30",
        isActive && cn(activeBorderColor, activeBg),
        !isActive && isKey && highlightColor,
        !isActive && !isKey && "text-muted-foreground/60",
      )}
    >
      {signature && <KindBadge kind={signature.kind} />}
      <span className="truncate">{name}</span>
    </button>
  );
}

// ── Mobile accordion ─────────────────────────────────────────────

function MobileAccordion({
  keyExports,
  detectedExports,
  detectedTypes,
  visibleExports,
  hasOverflow,
  expanded,
  setExpanded,
  signatures,
  highlightColor,
  keySet,
  isGold,
  allNames: _allNames,
}: {
  keyExports: string[];
  detectedExports: string[];
  detectedTypes: string[];
  visibleExports: string[];
  hasOverflow: boolean;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  signatures: Record<string, ExportSignature>;
  highlightColor: string;
  keySet: Set<string>;
  isGold: boolean;
  allNames: string[];
}) {
  // Build a deduplicated ordered list of exports for the accordion
  const seen = new Set<string>();
  const sections: { header: string; items: string[] }[] = [];

  if (keyExports.length > 0) {
    const items = keyExports.filter((e) => {
      if (seen.has(e)) return false;
      seen.add(e);
      return true;
    });
    if (items.length > 0) sections.push({ header: "Key Exports", items });
  }

  {
    const items = visibleExports.filter((e) => {
      if (seen.has(e)) return false;
      seen.add(e);
      return true;
    });
    if (items.length > 0)
      sections.push({
        header: `All Exports (${detectedExports.length})`,
        items,
      });
  }

  {
    const items = detectedTypes.filter((t) => {
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });
    if (items.length > 0)
      sections.push({
        header: `Type Exports (${detectedTypes.length})`,
        items,
      });
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.header}>
          <SectionHeader>{section.header}</SectionHeader>
          <div className="rounded-lg border border-[var(--border-primitive)]/15 bg-background/80">
            <Accordion type="single" collapsible>
              {section.items.map((name) => {
                const sig = findSignature(name, signatures);
                const isKey = keySet.has(name);
                return (
                  <AccordionItem
                    key={name}
                    value={name}
                    className="border-b border-[var(--border-primitive)]/10 last:border-b-0"
                  >
                    <AccordionTrigger
                      className={cn(
                        "px-3 py-2 font-mono text-xs hover:no-underline",
                        isKey ? highlightColor : "text-muted-foreground/60",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {sig && <KindBadge kind={sig.kind} />}
                        <span className="truncate">{name}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">
                      {sig ? (
                        <TypeDetailPanel
                          signature={sig}
                          isGold={isGold}
                          className="border-0 bg-transparent p-0 backdrop-blur-none lg:static lg:max-h-none lg:overflow-visible"
                        />
                      ) : (
                        <p className="text-xs italic text-muted-foreground/40">
                          No type signature available
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
            {section.header.startsWith("All Exports") && hasOverflow && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-3 py-2 text-left font-mono text-[10px] text-[var(--color-primitive)]/60 transition-colors hover:text-[var(--color-primitive)]"
              >
                {expanded
                  ? "Show less"
                  : `+ ${detectedExports.length - MAX_VISIBLE} more`}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground/50">
      {children}
    </h4>
  );
}

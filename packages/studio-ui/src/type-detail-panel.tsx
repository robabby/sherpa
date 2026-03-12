"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "./lib/utils";
import type { ExportSignature } from "@/lib/studio";
import { KindBadge } from "./kind-badge";

interface TypeDetailPanelProps {
  signature: ExportSignature | null;
  isGold: boolean;
  className?: string;
}

export function TypeDetailPanel({
  signature,
  isGold,
  className,
}: TypeDetailPanelProps) {
  const typeColor = isGold
    ? "text-[var(--color-gold-bright)]"
    : "text-[var(--color-primitive-bright)]";
  const arrowColor = isGold
    ? "text-[var(--color-gold-bright)]"
    : "text-[var(--color-primitive)]";

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-primitive)]/20 bg-card/30 p-5 backdrop-blur-sm",
        "lg:sticky lg:top-8 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {signature ? (
          <motion.div
            key={signature.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div className="mb-4 flex items-center gap-2">
              <KindBadge kind={signature.kind} />
              <h3 className="font-mono text-sm font-medium text-foreground">
                {signature.name}
              </h3>
            </div>

            {/* Kind-specific rendering */}
            <SignatureBody signature={signature} typeColor={typeColor} arrowColor={arrowColor} />

            {/* Referenced types */}
            {signature.referencedTypes &&
              Object.keys(signature.referencedTypes).length > 0 && (
                <ReferencedTypesSection
                  types={signature.referencedTypes}
                  typeColor={typeColor}
                  arrowColor={arrowColor}
                />
              )}
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="py-8 text-center text-sm italic text-muted-foreground/50"
          >
            Select an export to view its type signature
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Kind-specific renderers ──────────────────────────────────────

function SignatureBody({
  signature,
  typeColor,
  arrowColor,
}: {
  signature: ExportSignature;
  typeColor: string;
  arrowColor: string;
}) {
  switch (signature.kind) {
    case "function":
      return (
        <FunctionSignature
          signature={signature}
          typeColor={typeColor}
          arrowColor={arrowColor}
        />
      );
    case "interface":
      return (
        <InterfaceSignature signature={signature} typeColor={typeColor} />
      );
    case "type-alias":
      return <TypeAliasSignature signature={signature} />;
    case "variable":
      return <VariableSignature signature={signature} typeColor={typeColor} />;
    case "enum":
      return <EnumSignature signature={signature} typeColor={typeColor} />;
    default:
      return <FallbackSignature signature={signature} />;
  }
}

function FunctionSignature({
  signature,
  typeColor,
  arrowColor,
}: {
  signature: ExportSignature;
  typeColor: string;
  arrowColor: string;
}) {
  return (
    <div className="space-y-3">
      {/* Parameters */}
      {signature.parameters && signature.parameters.length > 0 && (
        <div>
          <h4 className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50">
            Parameters
          </h4>
          <div className="space-y-1">
            {signature.parameters.map((param) => (
              <div key={param.name} className="flex items-baseline gap-1.5 font-mono text-xs">
                <span className="text-foreground/90">
                  {param.name}
                  {param.optional && (
                    <span className="text-muted-foreground/40">?</span>
                  )}
                </span>
                <span className="text-muted-foreground/30">:</span>
                <span className={cn("break-all", typeColor)}>
                  {param.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Return type */}
      {signature.returnType && (
        <div className="flex items-baseline gap-1.5 font-mono text-xs">
          <span className={arrowColor}>→</span>
          <span className={cn("break-all", typeColor)}>
            {signature.returnType}
          </span>
        </div>
      )}
    </div>
  );
}

function InterfaceSignature({
  signature,
  typeColor,
}: {
  signature: ExportSignature;
  typeColor: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const props = signature.properties ?? [];
  const truncated = props.length > 10 && !showAll;
  const visible = truncated ? props.slice(0, 10) : props;

  return (
    <div>
      <h4 className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50">
        Properties
      </h4>
      <div className="space-y-1">
        {visible.map((prop) => (
          <div key={prop.name} className="flex items-baseline gap-1.5 font-mono text-xs">
            <span className="text-foreground/90">
              {prop.name}
              {prop.optional && (
                <span className="text-muted-foreground/40">?</span>
              )}
            </span>
            <span className="text-muted-foreground/30">:</span>
            <span className={cn("break-all", typeColor)}>{prop.type}</span>
          </div>
        ))}
      </div>
      {props.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 font-mono text-[10px] text-[var(--color-primitive)]/60 transition-colors hover:text-[var(--color-primitive)]"
        >
          {showAll ? "Show less" : `Show all ${props.length} properties`}
        </button>
      )}
    </div>
  );
}

function TypeAliasSignature({
  signature,
}: {
  signature: ExportSignature;
}) {
  const text = signature.text.replace(/^export\s+/, "");

  return (
    <pre className="whitespace-pre-wrap break-all font-mono text-xs text-foreground/80">
      {text}
    </pre>
  );
}

function VariableSignature({
  signature,
  typeColor,
}: {
  signature: ExportSignature;
  typeColor: string;
}) {
  const [showSource, setShowSource] = useState(false);
  const hasLongSource = signature.text.length > 200;

  return (
    <div className="space-y-2">
      {signature.returnType && (
        <div className="font-mono text-xs">
          <span className={cn("break-all", typeColor)}>
            {signature.returnType}
          </span>
        </div>
      )}
      {hasLongSource ? (
        <>
          <button
            onClick={() => setShowSource(!showSource)}
            className="font-mono text-[10px] text-[var(--color-primitive)]/60 transition-colors hover:text-[var(--color-primitive)]"
          >
            {showSource ? "Hide source" : "Show source"}
          </button>
          {showSource && (
            <pre className="whitespace-pre-wrap break-all font-mono text-xs text-foreground/60">
              {signature.text}
            </pre>
          )}
        </>
      ) : (
        <pre className="whitespace-pre-wrap break-all font-mono text-xs text-foreground/60">
          {signature.text}
        </pre>
      )}
    </div>
  );
}

function EnumSignature({
  signature,
  typeColor,
}: {
  signature: ExportSignature;
  typeColor: string;
}) {
  const members = signature.members ?? [];

  return (
    <div>
      <h4 className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50">
        Members
      </h4>
      <div className="space-y-1">
        {members.map((member) => (
          <div key={member.name} className="flex items-baseline gap-1.5 font-mono text-xs">
            <span className="text-foreground/90">{member.name}</span>
            {member.value !== undefined && (
              <>
                <span className="text-muted-foreground/30">=</span>
                <span className={typeColor}>{String(member.value)}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FallbackSignature({
  signature,
}: {
  signature: ExportSignature;
}) {
  return (
    <pre className="whitespace-pre-wrap break-all font-mono text-xs text-foreground/60">
      {signature.text}
    </pre>
  );
}

// ── Referenced types ─────────────────────────────────────────────

function ReferencedTypesSection({
  types,
  typeColor,
  arrowColor,
}: {
  types: Record<string, ExportSignature>;
  typeColor: string;
  arrowColor: string;
}) {
  return (
    <div className="mt-5 border-t border-[var(--border-primitive)]/10 pt-4">
      <h4 className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50">
        Referenced Types
      </h4>
      <div className="space-y-2">
        {Object.values(types).map((refSig) => (
          <div
            key={refSig.name}
            className="rounded-lg border border-[var(--border-primitive)]/10 bg-card/20 p-3"
          >
            <div className="mb-2 flex items-center gap-2">
              <KindBadge kind={refSig.kind} />
              <span className="font-mono text-xs font-medium text-foreground/80">
                {refSig.name}
              </span>
            </div>
            <SignatureBody
              signature={refSig}
              typeColor={typeColor}
              arrowColor={arrowColor}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

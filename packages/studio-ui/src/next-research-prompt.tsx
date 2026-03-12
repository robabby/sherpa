"use client";

import { useState, useCallback } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "./lib/utils";

interface NextResearchPromptProps {
  initiativeSlug: string;
  openQuestions: string[];
}

export function NextResearchPrompt({
  initiativeSlug,
  openQuestions,
}: NextResearchPromptProps) {
  const [copied, setCopied] = useState(false);

  const promptText = `/rr ${initiativeSlug}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  }, [promptText]);

  if (openQuestions.length === 0) return null;

  return (
    <div>
      <span className="mb-4 block text-xs uppercase tracking-widest text-[var(--color-copper)]">
        Next Research Prompt
      </span>
      <div className="rounded-lg border border-[var(--color-copper)]/20 bg-card/40 backdrop-blur-sm">
        {/* Command bar */}
        <div className="flex items-center justify-between border-b border-[var(--color-copper)]/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-[var(--color-copper)]/60" />
            <code className="font-mono text-sm text-foreground">{promptText}</code>
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors",
              "hover:bg-[var(--color-copper)]/10",
              copied
                ? "text-emerald-400"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Copy command to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Open questions */}
        <div className="px-4 py-3">
          <span className="mb-2 block text-[10px] uppercase tracking-widest text-muted-foreground/50">
            Seed Questions
          </span>
          <ol className="space-y-1.5 text-sm text-foreground/70">
            {openQuestions.map((question, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 font-mono text-xs text-muted-foreground/40">
                  {i + 1}.
                </span>
                <span>{question.replace(/\*\*(.+?)\*\*/g, "$1")}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

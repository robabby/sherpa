"use client";

import { useState, useCallback } from "react";
import { Check, Terminal, FileText, FlaskConical, ListChecks, Users, Workflow, Sunrise, ListTodo, ClipboardCheck, Scissors, Target, Zap, PenTool, AlertTriangle, Shield, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "./lib/utils";

const VARIANT_CONFIG = {
  rr: { icon: Terminal, label: "Copy /rr", className: "text-[var(--color-copper)]/70 hover:text-[var(--color-copper)]" },
  planning: { icon: FileText, label: "Copy plan", className: "text-[var(--color-gold-muted)]/70 hover:text-[var(--color-gold-muted)]" },
  synthesize: { icon: FlaskConical, label: "Synthesize", className: "text-[var(--color-gold-bright)]/70 hover:text-[var(--color-gold-bright)]" },
  curate: { icon: ListChecks, label: "Curate", className: "text-[var(--color-bronze)]/70 hover:text-[var(--color-bronze)]" },
  workforce: { icon: Users, label: "Role prompt", className: "text-[var(--color-eclipse)]/70 hover:text-[var(--color-eclipse)]" },
  pipeline: { icon: Workflow, label: "Copy command", className: "text-[var(--color-transit)]/70 hover:text-[var(--color-transit)]" },
  morning: { icon: Sunrise, label: "/morning", className: "text-[var(--color-gold)]/70 hover:text-[var(--color-gold)]" },
  "plan-tasks": { icon: ListTodo, label: "/plan-tasks", className: "text-[var(--color-copper)]/70 hover:text-[var(--color-copper)]" },
  "integration-review": { icon: ClipboardCheck, label: "Review", className: "text-[var(--color-gold-muted)]/70 hover:text-[var(--color-gold-muted)]" },
  shape: { icon: Scissors, label: "/shape", className: "text-[var(--color-copper)]/70 hover:text-[var(--color-copper)]" },
  stake: { icon: Target, label: "/stake", className: "text-[var(--color-gold)]/70 hover:text-[var(--color-gold)]" },
  spike: { icon: Zap, label: "/spike", className: "text-[var(--color-gold-bright)]/70 hover:text-[var(--color-gold-bright)]" },
  design: { icon: PenTool, label: "/design", className: "text-[var(--color-gold-muted)]/70 hover:text-[var(--color-gold-muted)]" },
  premortem: { icon: AlertTriangle, label: "/premortem", className: "text-[var(--color-bronze)]/70 hover:text-[var(--color-bronze)]" },
  "stress-test": { icon: Shield, label: "/stress-test", className: "text-[var(--color-copper)]/70 hover:text-[var(--color-copper)]" },
  memo: { icon: FileText, label: "/memo", className: "text-[var(--color-eclipse)]/70 hover:text-[var(--color-eclipse)]" },
  radar: { icon: Radar, label: "/radar", className: "text-[var(--color-gold-bright)]/70 hover:text-[var(--color-gold-bright)]" },
} as const;

interface PromptCopyButtonProps {
  prompt: string;
  variant: keyof typeof VARIANT_CONFIG;
  label?: string;
}

export function PromptCopyButton({
  prompt,
  variant,
  label,
}: PromptCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  }, [prompt]);

  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;
  const buttonLabel = label ?? config.label;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={cn(
            "h-7 gap-1.5 px-2 text-xs",
            copied ? "text-emerald-400" : config.className,
          )}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Icon className="h-3.5 w-3.5" />
          )}
          <span>{copied ? "Copied" : buttonLabel}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="max-w-sm whitespace-pre-wrap font-mono text-[10px]"
      >
        {prompt}
      </TooltipContent>
    </Tooltip>
  );
}

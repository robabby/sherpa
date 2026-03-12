import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Box,
  Network,
  ScrollText,
  Sprout,
  Target,
  Wand2,
} from "lucide-react";

import type { ProcessViewKind } from "@/lib/studio/process-nodes-shared";
import { cn } from "./lib/utils";

const KIND_ICONS: Record<ProcessViewKind, LucideIcon> = {
  "initiative-tree": Network,
  initiative: Target,
  workstream: Activity,
  seed: Sprout,
  skill: Wand2,
  convention: ScrollText,
  primitive: Box,
};

interface ProcessKindIconProps {
  kind: ProcessViewKind;
  className?: string;
}

export function ProcessKindIcon({ kind, className }: ProcessKindIconProps) {
  const Icon = KIND_ICONS[kind];
  return <Icon className={cn("h-4 w-4", className)} />;
}

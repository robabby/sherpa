"use client";

import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Text } from "@radix-ui/themes";

import { ActivityEntry } from "./activity-entry";
import { InitiativeContents } from "./initiative-contents";
import { ResearchTreeClient } from "./research-tree-client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { cn } from "./lib/utils";
import type {
  ActivityEntry as ActivityEntryType,
  ActivitySegment,
  BranchSeed,
  ContentFile,
  DeliverableSummary,
  ResearchTreeNode,
} from "@/lib/studio/types";

interface UnifiedCardClientProps {
  storageKey: string;
  initiativeSlug: string;
  parsedActivity: { entry: ActivityEntryType; segments: ActivitySegment[] }[];
  researchTree: ResearchTreeNode | null;
  branchSeeds: BranchSeed[];
  contentsFiles: Record<string, ContentFile[]>;
  targets: string[];
  deliverableSummaries: DeliverableSummary[];
  hasContent: boolean;
}

export function UnifiedCardClient({
  storageKey,
  initiativeSlug,
  parsedActivity,
  researchTree,
  branchSeeds,
  contentsFiles,
  targets,
  deliverableSummaries,
  hasContent,
}: UnifiedCardClientProps) {
  const [isOpen, setIsOpen] = usePersistedState(storageKey, false);

  if (!hasContent) return null;

  const hasActivity = parsedActivity.length > 0;
  const hasResearch = researchTree !== null;
  const hasContents = Object.keys(contentsFiles).length > 0 || targets.length > 0;
  const hasDeliverables = deliverableSummaries.length > 0;

  // Determine default tab
  const defaultTab = hasActivity ? "activity" : hasResearch ? "research" : "contents";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-center gap-1 py-2",
          "border-t border-[var(--border-gold)]/15",
          "text-xs text-muted-foreground/40 transition-colors hover:text-[var(--color-copper)]",
        )}
      >
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
              <div className="border-t border-[var(--border-gold)]/15 px-5 pb-5 pt-3">
                <Tabs defaultValue={defaultTab}>
                  <TabsList className="mb-4 h-8 bg-transparent p-0">
                    {hasActivity && (
                      <TabsTrigger
                        value="activity"
                        className="h-7 rounded-md px-3 text-xs uppercase tracking-[0.1em] data-[state=active]:bg-[var(--color-gold)]/10 data-[state=active]:text-[var(--color-gold)]"
                      >
                        Activity
                      </TabsTrigger>
                    )}
                    {hasResearch && (
                      <TabsTrigger
                        value="research"
                        className="h-7 rounded-md px-3 text-xs uppercase tracking-[0.1em] data-[state=active]:bg-[var(--color-gold)]/10 data-[state=active]:text-[var(--color-gold)]"
                      >
                        Research
                      </TabsTrigger>
                    )}
                    {hasContents && (
                      <TabsTrigger
                        value="contents"
                        className="h-7 rounded-md px-3 text-xs uppercase tracking-[0.1em] data-[state=active]:bg-[var(--color-gold)]/10 data-[state=active]:text-[var(--color-gold)]"
                      >
                        Contents
                      </TabsTrigger>
                    )}
                    {hasDeliverables && (
                      <TabsTrigger
                        value="deliverables"
                        className="h-7 rounded-md px-3 text-xs uppercase tracking-[0.1em] data-[state=active]:bg-[var(--color-gold)]/10 data-[state=active]:text-[var(--color-gold)]"
                      >
                        Deliverables
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {hasActivity && (
                    <TabsContent value="activity">
                      <div className="max-h-[400px] overflow-y-auto">
                        <div className="space-y-0">
                          {parsedActivity.map(({ entry, segments }, i) => (
                            <ActivityEntry
                              key={`${entry.date}-${i}`}
                              entry={entry}
                              segments={segments}
                              isFirst={i === 0}
                              isLast={i === parsedActivity.length - 1}
                            />
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {hasResearch && researchTree && (
                    <TabsContent value="research">
                      <ResearchTreeClient tree={researchTree} seeds={branchSeeds} />
                    </TabsContent>
                  )}

                  {hasContents && (
                    <TabsContent value="contents">
                      <div className="space-y-4">
                        {Object.keys(contentsFiles).length > 0 && (
                          <InitiativeContents
                            slug={initiativeSlug}
                            files={contentsFiles}
                          />
                        )}

                        {targets.length > 0 && (
                          <div>
                            <Text
                              size="1"
                              className="mb-2 block uppercase tracking-widest text-muted-foreground/50"
                            >
                              Targets
                            </Text>
                            <div className="flex flex-wrap gap-1.5">
                              {targets.map((target) => (
                                <span
                                  key={target}
                                  className="rounded-md bg-muted/50 px-2 py-0.5 font-mono text-xs text-muted-foreground"
                                >
                                  {target}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )}

                  {hasDeliverables && (
                    <TabsContent value="deliverables">
                      <div className="space-y-2">
                        {deliverableSummaries.map((d) => (
                          <a
                            key={d.id}
                            href={
                              d.type === "deck"
                                ? `/process/${initiativeSlug}/present/${d.id}`
                                : undefined
                            }
                            className={cn(
                              "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm",
                              d.type === "deck"
                                ? "cursor-pointer transition-colors hover:bg-[var(--color-copper)]/5"
                                : "",
                            )}
                          >
                            <span className="rounded bg-[var(--color-gold)]/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-[var(--color-gold)]/70">
                              {d.type}
                            </span>
                            <span className="flex-1 truncate text-foreground/80">
                              {d.title}
                            </span>
                            <span className="shrink-0 font-mono text-[10px] text-muted-foreground/40">
                              {d.created}
                            </span>
                          </a>
                        ))}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}

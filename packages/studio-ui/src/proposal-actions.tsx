"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ProposalActionsProps {
  slug: string;
  title: string;
  source: string;
  riskLevel: string | null;
  onStatusChange: (source: string, kind: string, newStatus: string) => Promise<{ success: boolean; error?: string }>;
  onPostApproval?: (slug: string, source: string) => Promise<{ success: boolean; tasks: string[]; error?: string }>;
}

export function ProposalActions({
  slug,
  title,
  source,
  riskLevel,
  onStatusChange,
  onPostApproval,
}: ProposalActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [automationResult, setAutomationResult] = useState<{
    tasks: string[];
    error?: string;
  } | null>(null);

  function handleAction(newStatus: "approved" | "declined") {
    startTransition(async () => {
      const result = await onStatusChange(source, "initiative", newStatus);
      if (!result.success) return;

      // Fire post-approval automation (non-blocking for the status change)
      if (newStatus === "approved" && onPostApproval) {
        const autoResult = await onPostApproval(slug, source);
        setAutomationResult({
          tasks: autoResult.tasks,
          error: autoResult.error,
        });
      }

      router.refresh();
    });
  }

  const riskWarning =
    riskLevel === "structural"
      ? "This is a structural change — it modifies how existing systems work."
      : riskLevel === "evolutionary"
        ? "This is an evolutionary change — it modifies existing artifacts."
        : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              disabled={isPending}
              className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Approve
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve &ldquo;{title}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  This moves the initiative to <strong>approved</strong> status.
                  An agent can then create an implementation plan and start a workstream.
                  {riskWarning && (
                    <span className="mt-2 block text-amber-500">{riskWarning}</span>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleAction("approved")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Approve
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              className="gap-1.5 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
            >
              <X className="h-3.5 w-3.5" />
              Decline
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Decline &ldquo;{title}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>
                This marks the proposal as declined. It can be reopened later by changing
                the status back to pending.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleAction("declined")}
                className="bg-rose-600 hover:bg-rose-700"
              >
                Decline
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Post-approval automation result */}
      {automationResult && (
        <div className="rounded-md border border-[var(--color-session)]/20 bg-[var(--color-session)]/5 p-3 text-sm">
          {automationResult.error ? (
            <div>
              <p className="mb-1 font-medium text-amber-400">Automation unavailable</p>
              <p className="text-muted-foreground">{automationResult.error}</p>
              {automationResult.tasks.length > 0 && (
                <div className="mt-2">
                  <p className="text-muted-foreground">Manual checklist:</p>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {automationResult.tasks.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="mb-1 font-medium text-emerald-400">Post-approval tasks completed</p>
              <ul className="list-inside list-disc text-muted-foreground">
                {automationResult.tasks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

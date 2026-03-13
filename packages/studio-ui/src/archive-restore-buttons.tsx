"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Loader2, RotateCcw } from "lucide-react";
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

// ---------------------------------------------------------------------------
// Archive Button
// ---------------------------------------------------------------------------

export function ArchiveButton({
  slug,
  title,
  onArchive,
}: {
  slug: string;
  title: string;
  onArchive: (slug: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mb-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            className="gap-1.5 border-muted-foreground/20 text-muted-foreground hover:bg-muted/50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
            Archive
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive &ldquo;{title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This moves the initiative to the archive. It will be hidden from
              the active process view but can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                startTransition(async () => {
                  await onArchive(slug);
                  router.refresh();
                });
              }}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Restore Button
// ---------------------------------------------------------------------------

export function RestoreButton({
  slug,
  title,
  onRestore,
}: {
  slug: string;
  title: string;
  onRestore: (slug: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mb-4">
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
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            Restore
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore &ldquo;{title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This moves the initiative back to active status. It will reappear
              in the process view as a pending initiative.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                startTransition(async () => {
                  await onRestore(slug);
                  router.refresh();
                });
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

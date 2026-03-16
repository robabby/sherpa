"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  GitBranch,
  CheckSquare,
  Send,
  Workflow,
  FileText,
  BookOpen,
  Zap,
  Play,
  Users,
  Clock,
  Plug,
  Activity,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import type {
  CommandPaletteData,
  CommandPaletteItem,
} from "@/app/actions/command-palette-items";
import { getCommandPaletteItems } from "@/app/actions/command-palette-items";

/* -------------------------------------------------------------------------- */
/*  Route icon map                                                             */
/* -------------------------------------------------------------------------- */

const ROUTE_ICONS: Record<string, React.ElementType> = {
  "/process": GitBranch,
  "/tasks": CheckSquare,
  "/dispatch": Send,
  "/workflow": Workflow,
  "/docs": FileText,
  "/conventions": BookOpen,
  "/skills": Zap,
  "/playbooks": Play,
  "/workforce": Users,
  "/sessions": Clock,
  "/mcp": Plug,
  "/activity": Activity,
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState<CommandPaletteData | null>(null);
  const [isPending, startTransition] = React.useTransition();

  /* ---- Keyboard shortcut ------------------------------------------------- */

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ---- Fetch items on open ----------------------------------------------- */

  React.useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      const items = await getCommandPaletteItems();
      setData(items);
    });
  }, [open]);

  /* ---- Select handler ---------------------------------------------------- */

  function handleSelect(href: string) {
    setOpen(false);
    router.push(href);
  }

  /* ---- Render ------------------------------------------------------------ */

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search pages, initiatives, tasks, and skills..."
    >
      <CommandInput placeholder="Type to search..." />
      <CommandList>
        <CommandEmpty>
          {isPending ? "Loading..." : "No results found."}
        </CommandEmpty>

        {data && (
          <>
            {/* Navigation routes */}
            {data.routes.length > 0 && (
              <CommandGroup heading="Navigation">
                {data.routes.map((item) => {
                  const Icon = ROUTE_ICONS[item.href] ?? FileText;
                  return (
                    <CommandItem
                      key={item.href}
                      keywords={item.keywords}
                      onSelect={() => handleSelect(item.href)}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {/* Initiatives */}
            {data.initiatives.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Initiatives">
                  {data.initiatives.map((item) => (
                    <CommandItem
                      key={item.href}
                      keywords={item.keywords}
                      onSelect={() => handleSelect(item.href)}
                    >
                      <GitBranch />
                      <span>{item.label}</span>
                      {item.status && (
                        <span className="ml-auto font-mono text-xs text-muted-foreground">
                          {item.status}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Tasks */}
            {data.tasks.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Tasks">
                  {data.tasks.map((item) => (
                    <CommandItem
                      key={item.href}
                      keywords={item.keywords}
                      onSelect={() => handleSelect(item.href)}
                    >
                      <CheckSquare />
                      <span>{item.label}</span>
                      {item.status && (
                        <span className="ml-auto font-mono text-xs text-muted-foreground">
                          {item.status}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Skills */}
            {data.skills.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Skills">
                  {data.skills.map((item) => (
                    <CommandItem
                      key={item.href}
                      keywords={item.keywords}
                      onSelect={() => handleSelect(item.href)}
                    >
                      <Zap />
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

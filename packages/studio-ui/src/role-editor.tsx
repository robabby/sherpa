"use client";

import { useState, useTransition } from "react";
import { Pencil, Save, X, Check, ChevronsUpDown } from "lucide-react";
import { Text } from "@radix-ui/themes";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "./lib/utils";
import type {
  AgentRole,
  AgentRoleCategory,
  AgentModelTier,
  AgentPattern,
  AgentStructure,
} from "@/lib/studio/types";
import {
  AGENT_ROLE_CATEGORIES,
  AGENT_MODEL_TIERS,
  AGENT_PATTERNS,
  AGENT_STRUCTURES,
} from "@/lib/studio/types";
import { updateAgentRole } from "@/app/(studio)/workforce/actions";

interface RoleEditorProps {
  role: AgentRole;
}

export function RoleEditor({ role }: RoleEditorProps) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState<AgentRoleCategory>(role.category);
  const [modelTier, setModelTier] = useState<AgentModelTier>(role.modelTier);
  const [structure, setStructure] = useState<AgentStructure | null>(
    role.structure,
  );
  const [patterns, setPatterns] = useState<AgentPattern[]>(role.patterns);
  const [contextPackages, setContextPackages] = useState(
    role.contextPackages.join("\n"),
  );
  const [rules, setRules] = useState(role.rules.join("\n"));
  const [skills, setSkills] = useState(role.skills.join("\n"));
  const [toolPermissions, setToolPermissions] = useState(
    role.toolPermissions.join("\n"),
  );
  const [escalation, setEscalation] = useState(role.escalation.join("\n"));
  const [body, setBody] = useState(role.description);

  function resetForm() {
    setCategory(role.category);
    setModelTier(role.modelTier);
    setStructure(role.structure);
    setPatterns(role.patterns);
    setContextPackages(role.contextPackages.join("\n"));
    setRules(role.rules.join("\n"));
    setSkills(role.skills.join("\n"));
    setToolPermissions(role.toolPermissions.join("\n"));
    setEscalation(role.escalation.join("\n"));
    setBody(role.description);
    setError(null);
  }

  function handleCancel() {
    resetForm();
    setEditing(false);
  }

  function splitLines(text: string): string[] {
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateAgentRole(role.slug, {
        frontmatter: {
          role: role.slug,
          "display-name": role.displayName,
          category,
          "model-tier": modelTier,
          patterns,
          structure: structure ?? null,
          "context-packages": splitLines(contextPackages),
          rules: splitLines(rules),
          skills: splitLines(skills),
          "tool-permissions": splitLines(toolPermissions),
          escalation: splitLines(escalation),
        },
        body,
      });

      if (result.success) {
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          setEditing(false);
        }, 1200);
      } else {
        setError(result.error ?? "Save failed");
      }
    });
  }

  if (!editing) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setEditing(true)}
        className="h-7 gap-1.5 px-2 text-xs text-[var(--color-eclipse)]/70 hover:text-[var(--color-eclipse)]"
      >
        <Pencil className="h-3.5 w-3.5" />
        <span>Edit</span>
      </Button>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={isPending}
          className={cn(
            "h-7 gap-1.5 px-2 text-xs",
            saved
              ? "text-[var(--color-gold)]"
              : "text-emerald-400 hover:text-emerald-300",
          )}
        >
          {saved ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          <span>{saved ? "Saved" : isPending ? "Saving…" : "Save"}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isPending}
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground/60 hover:text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
          <span>Cancel</span>
        </Button>
        {error && (
          <Text size="1" className="text-destructive">
            {error}
          </Text>
        )}
      </div>

      {/* Enum fields */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/60">
            Category
          </Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as AgentRoleCategory)}
          >
            <SelectTrigger className="h-8 border-[var(--color-eclipse)]/20 bg-transparent text-xs focus:ring-[var(--color-eclipse)]/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AGENT_ROLE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/60">
            Model Tier
          </Label>
          <Select
            value={modelTier}
            onValueChange={(v) => setModelTier(v as AgentModelTier)}
          >
            <SelectTrigger className="h-8 border-[var(--color-eclipse)]/20 bg-transparent text-xs focus:ring-[var(--color-eclipse)]/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AGENT_MODEL_TIERS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/60">
            Structure
          </Label>
          <Select
            value={structure ?? "__none__"}
            onValueChange={(v) =>
              setStructure(v === "__none__" ? null : (v as AgentStructure))
            }
          >
            <SelectTrigger className="h-8 border-[var(--color-eclipse)]/20 bg-transparent text-xs focus:ring-[var(--color-eclipse)]/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {AGENT_STRUCTURES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Patterns multi-select */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground/60">
          Patterns
        </Label>
        <PatternMultiSelect selected={patterns} onChange={setPatterns} />
      </div>

      {/* Text array fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextArrayField
          label="Context Packages"
          value={contextPackages}
          onChange={setContextPackages}
          mono
        />
        <TextArrayField label="Rules" value={rules} onChange={setRules} mono />
        <TextArrayField
          label="Skills"
          value={skills}
          onChange={setSkills}
          mono
        />
        <TextArrayField
          label="Tool Permissions"
          value={toolPermissions}
          onChange={setToolPermissions}
          mono
        />
        <TextArrayField
          label="Escalation"
          value={escalation}
          onChange={setEscalation}
        />
      </div>

      {/* Markdown body */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground/60">
          Description (Markdown)
        </Label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          className="max-w-prose border-muted-foreground/15 bg-transparent font-mono text-xs focus-visible:ring-[var(--color-eclipse)]/40"
        />
      </div>
    </div>
  );
}

function TextArrayField({
  label,
  value,
  onChange,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground/60">
        {label}
      </Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={cn(
          "border-muted-foreground/15 bg-transparent text-xs focus-visible:ring-[var(--color-eclipse)]/40",
          mono && "font-mono",
        )}
        placeholder="One per line"
      />
    </div>
  );
}

function PatternMultiSelect({
  selected,
  onChange,
}: {
  selected: AgentPattern[];
  onChange: (v: AgentPattern[]) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle(pattern: AgentPattern) {
    if (selected.includes(pattern)) {
      onChange(selected.filter((p) => p !== pattern));
    } else {
      onChange([...selected, pattern]);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {selected.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => toggle(p)}
            className="inline-flex items-center rounded-full border border-[var(--color-eclipse)]/30 bg-[var(--color-eclipse)]/10 px-2.5 py-0.5 text-xs text-[var(--color-eclipse)] hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          >
            {p}
            <X className="ml-1 h-3 w-3" />
          </button>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 border-muted-foreground/15 bg-transparent px-2 text-xs text-muted-foreground"
          >
            Add pattern
            <ChevronsUpDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search patterns…" className="h-8" />
            <CommandList>
              <CommandEmpty>No pattern found.</CommandEmpty>
              <CommandGroup>
                {AGENT_PATTERNS.map((p) => (
                  <CommandItem
                    key={p}
                    value={p}
                    onSelect={() => toggle(p)}
                    className="text-xs"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3.5 w-3.5",
                        selected.includes(p) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {p}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

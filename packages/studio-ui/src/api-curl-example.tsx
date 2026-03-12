"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "./lib/utils";

interface ApiCurlExampleProps {
  method: "GET" | "POST";
  path: string;
  auth: "none" | "required";
}

export function ApiCurlExample({ method, path, auth }: ApiCurlExampleProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl = "https://wavepoint.space/api/v1";
  const parts = [`curl -X ${method} "${baseUrl}${path}"`];
  if (auth === "required") {
    parts.push('  -H "Authorization: Bearer $TOKEN"');
  }
  if (method === "POST") {
    parts.push('  -H "Content-Type: application/json"');
    parts.push('  -d \'{}\'');
  }
  const command = parts.join(" \\\n");

  function handleCopy() {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="group relative rounded-lg border border-[var(--color-api)]/15 bg-card/40">
      <div className="flex items-center justify-between border-b border-[var(--color-api)]/10 px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
          cURL
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1 rounded px-2 py-0.5 text-[10px] transition-colors",
            copied
              ? "text-emerald-500"
              : "text-muted-foreground/50 hover:text-[var(--color-api)]",
          )}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground/80">
        {command}
      </pre>
    </div>
  );
}

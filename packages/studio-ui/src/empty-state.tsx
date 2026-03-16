import { cn } from "./lib/utils";

/* -------------------------------------------------------------------------- */
/*  EmptyState — compound component for functional empty states               */
/*  Follows the shadcn Card compound pattern.                                 */
/* -------------------------------------------------------------------------- */

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function EmptyState({ className, children, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ---- Icon ---------------------------------------------------------------- */

interface EmptyStateIconProps {
  children: React.ReactNode;
  className?: string;
}

export function EmptyStateIcon({ children, className }: EmptyStateIconProps) {
  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center rounded-lg border border-[var(--border-gold)]/20 bg-muted/30 text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---- Title --------------------------------------------------------------- */

interface EmptyStateTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function EmptyStateTitle({ children, className }: EmptyStateTitleProps) {
  return (
    <h3
      className={cn(
        "font-heading text-lg font-medium tracking-tight text-foreground/90",
        className,
      )}
    >
      {children}
    </h3>
  );
}

/* ---- Description --------------------------------------------------------- */

interface EmptyStateDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function EmptyStateDescription({
  children,
  className,
}: EmptyStateDescriptionProps) {
  return (
    <p className={cn("max-w-sm text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

/* ---- Command ------------------------------------------------------------- */

interface EmptyStateCommandProps {
  children: React.ReactNode;
  className?: string;
}

export function EmptyStateCommand({
  children,
  className,
}: EmptyStateCommandProps) {
  return (
    <code
      className={cn(
        "mt-1 rounded-md border border-[var(--border-gold)]/20 bg-muted/30 px-3 py-1.5 font-mono text-xs text-[var(--color-gold)]",
        className,
      )}
    >
      {children}
    </code>
  );
}

/* ---- Action -------------------------------------------------------------- */

interface EmptyStateActionProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  className?: string;
}

export function EmptyStateAction({
  children,
  className,
  ...props
}: EmptyStateActionProps) {
  return (
    <a
      className={cn(
        "mt-2 text-sm font-medium text-[var(--color-gold)] underline underline-offset-4 hover:text-[var(--color-gold-bright)]",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

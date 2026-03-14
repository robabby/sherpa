import type { ComponentPropsWithoutRef } from "react"

function H2(props: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className="mt-10 mb-4 font-heading text-2xl tracking-tight first:mt-0"
      {...props}
    />
  )
}

function H3(props: ComponentPropsWithoutRef<"h3">) {
  return <h3 className="mt-8 mb-3 text-lg font-semibold" {...props} />
}

function P(props: ComponentPropsWithoutRef<"p">) {
  return <p className="mb-4 leading-relaxed text-muted-foreground" {...props} />
}

function Ul(props: ComponentPropsWithoutRef<"ul">) {
  return <ul className="mb-4 space-y-2 pl-6 list-disc" {...props} />
}

function Ol(props: ComponentPropsWithoutRef<"ol">) {
  return <ol className="mb-4 space-y-2 pl-6 list-decimal" {...props} />
}

function Li(props: ComponentPropsWithoutRef<"li">) {
  return <li className="text-muted-foreground" {...props} />
}

function Strong(props: ComponentPropsWithoutRef<"strong">) {
  return <strong className="font-semibold text-foreground" {...props} />
}

function A(props: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      className="text-primary underline underline-offset-4 hover:text-primary/80"
      {...props}
    />
  )
}

function Blockquote(props: ComponentPropsWithoutRef<"blockquote">) {
  return (
    <blockquote
      className="mb-4 border-l-2 border-primary/30 pl-4 italic text-muted-foreground"
      {...props}
    />
  )
}

function Code(props: ComponentPropsWithoutRef<"code">) {
  return (
    <code
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
      {...props}
    />
  )
}

function Pre(props: ComponentPropsWithoutRef<"pre">) {
  return (
    <pre
      className="mb-4 overflow-x-auto rounded-lg border border-border/60 bg-card p-4 font-mono text-sm"
      {...props}
    />
  )
}

function Hr(props: ComponentPropsWithoutRef<"hr">) {
  return <hr className="my-8 border-border/40" {...props} />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mdxComponents: Record<string, React.ComponentType<any>> = {
  h2: H2,
  h3: H3,
  p: P,
  ul: Ul,
  ol: Ol,
  li: Li,
  strong: Strong,
  a: A,
  blockquote: Blockquote,
  code: Code,
  pre: Pre,
  hr: Hr,
}

"use client"

import { useMemo, type JSX } from "react"
import * as runtime from "react/jsx-runtime"

interface MDXContentProps {
  code: string
}

type Props = JSX.IntrinsicElements

const components = {
  h2: (props: Props["h2"]) => (
    <h2 className="mt-10 mb-4 font-heading text-2xl tracking-tight first:mt-0" {...props} />
  ),
  h3: (props: Props["h3"]) => <h3 className="mt-8 mb-3 text-lg font-semibold" {...props} />,
  p: (props: Props["p"]) => <p className="mb-4 leading-relaxed text-muted-foreground" {...props} />,
  ul: (props: Props["ul"]) => <ul className="mb-4 space-y-2 pl-6 list-disc" {...props} />,
  ol: (props: Props["ol"]) => <ol className="mb-4 space-y-2 pl-6 list-decimal" {...props} />,
  li: (props: Props["li"]) => <li className="text-muted-foreground" {...props} />,
  strong: (props: Props["strong"]) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  a: (props: Props["a"]) => (
    <a className="text-primary underline underline-offset-4 hover:text-primary/80" {...props} />
  ),
  blockquote: (props: Props["blockquote"]) => (
    <blockquote
      className="mb-4 border-l-2 border-primary/30 pl-4 italic text-muted-foreground"
      {...props}
    />
  ),
  code: (props: Props["code"]) => (
    <code
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
      {...props}
    />
  ),
  pre: (props: Props["pre"]) => (
    <pre
      className="mb-4 overflow-x-auto rounded-lg border border-border/60 bg-card p-4 font-mono text-sm"
      {...props}
    />
  ),
  hr: (props: Props["hr"]) => <hr className="my-8 border-border/40" {...props} />,
}

export function MDXContent({ code }: MDXContentProps) {
  const Component = useMemo(() => {
    const fn = new Function(code)
    return fn({ ...runtime }).default
  }, [code])

  return <Component components={components} />
}

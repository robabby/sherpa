import Image from "next/image"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { FRAMEWORK_STATS as STATS } from "@/generated/framework-stats"

const captures = [
  {
    src: "/studio/process-workspace.png",
    alt: "Sherpa Studio process workspace showing an initiative tree with lifecycle states and a selected initiative's review trail",
    caption: `${STATS.initiatives} initiatives tracked from proposal to integration — every node is a real decision with a review trail.`,
  },
  {
    src: "/studio/task-board.png",
    alt: "Sherpa Studio task board listing dispatched agent missions with per-backend filter chips",
    caption: "100 dispatched agent missions across 9 backends. 38 shipped.",
  },
  {
    src: "/studio/research-dashboard.png",
    alt: "Sherpa Studio research dashboard showing a heartbeat schedule and dated reports grouped into intelligence streams",
    caption:
      "Autonomous research running on a heartbeat, 8am–11pm, feeding nine intelligence streams.",
  },
]

function SeeItRunningContent() {
  return (
    <>
      <ScrollReveal>
        <h2 className="font-heading text-2xl tracking-tight md:text-3xl">
          This is Sherpa governing its own development.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Screenshots from Sherpa Studio — the dashboard this repository runs
          on, with its real governance data.
        </p>
      </ScrollReveal>
      {captures.map((capture, i) => (
        <ScrollReveal key={capture.src} delay={0.1 + i * 0.05}>
          <figure className="mt-10">
            <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
              <Image
                src={capture.src}
                alt={capture.alt}
                width={1440}
                height={900}
                className="w-full"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
            <figcaption className="mt-3 text-sm text-muted-foreground">
              {capture.caption}
            </figcaption>
          </figure>
        </ScrollReveal>
      ))}
    </>
  )
}

export function SeeItRunningSection({ embedded = false }: { embedded?: boolean }) {
  if (embedded) {
    return (
      <div id="see-it-running" className="mt-16">
        <SeeItRunningContent />
      </div>
    )
  }
  return (
    <section id="see-it-running" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <SeeItRunningContent />
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { Easing } from "motion"

const ease: Easing = [0, 0, 0.2, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease, delay: i * 0.12 },
  }),
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-28 md:pb-36 md:pt-40">
      <div className="mx-auto max-w-3xl text-center">
        <motion.h1
          className="font-heading text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          Governance for AI agents,{" "}
          <span className="text-primary">built into your codebase.</span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          Sherpa gives Human+AI teams what code review gave engineering:
          roles, quality gates, and an audit trail for every decision. Watch
          it run its own development.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <Link href="#see-it-running">
            <Button size="lg">
              See it running
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button size="lg" variant="ghost">
              Read the docs
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

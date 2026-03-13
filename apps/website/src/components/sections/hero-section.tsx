"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle } from "lucide-react"

const stats = [
  { value: "91%", label: "of C-suite execs admit faking AI knowledge" },
  { value: "95%", label: "of AI pilots fail to reach production" },
  { value: "97%", label: "say AI will transform — only 9% have deployed" },
]

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
    <section className="relative overflow-hidden px-6 pb-20 pt-24 md:pb-28 md:pt-32">
      <div className="mx-auto max-w-4xl text-center">
        <motion.h1
          className="font-heading text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          AI Adoption Is Failing.{" "}
          <span className="text-primary">It Doesn&apos;t Have To.</span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          Behavioral governance for agentic workflows — and the guides who know
          how to use it.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <Link href="/framework">
            <Button variant="outline" size="lg">
              Get Started
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg">
              Talk to a Guide
              <MessageCircle data-icon="inline-end" />
            </Button>
          </Link>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          {stats.map((stat) => (
            <div key={stat.value} className="text-center">
              <p className="font-heading text-3xl tracking-tight text-primary md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

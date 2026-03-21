import { HeroSection } from "@/components/sections/hero-section"
import { WhatWeBuiltSection } from "@/components/sections/dual-value-section"
import { ProofSection } from "@/components/sections/trust-section"
import { CtaSection } from "@/components/sections/cta-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhatWeBuiltSection />
      <ProofSection />
      <CtaSection />
    </>
  )
}

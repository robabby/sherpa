import { HeroSection } from "@/components/sections/hero-section"
import { WhatWeDoSection } from "@/components/sections/dual-value-section"
import { RealitySection } from "@/components/sections/how-it-works-section"
import { TrustSection } from "@/components/sections/trust-section"
import { CtaSection } from "@/components/sections/cta-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhatWeDoSection />
      <RealitySection />
      <TrustSection />
      <CtaSection />
    </>
  )
}

import { HeroSection } from "@/components/sections/hero-section"
import { DualValueSection } from "@/components/sections/dual-value-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { TrustSection } from "@/components/sections/trust-section"
import { CtaSection } from "@/components/sections/cta-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <DualValueSection />
      <HowItWorksSection />
      <TrustSection />
      <CtaSection />
    </>
  )
}

import { Suspense } from "react";
import { LandingNav } from "@/components/shell/landing-nav";
import { Hero } from "@/components/landing/hero";
import { BrandTicker } from "@/components/landing/ticker";
import { Pathways } from "@/components/landing/pathways";
import { HowItWorks } from "@/components/landing/how";
import { Growth } from "@/components/landing/growth";
import { BrandShowcase } from "@/components/landing/brands";
import { SunshineFooter } from "@/components/landing/footer";
import { EntryPrompt } from "@/components/landing/entry-prompt";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <BrandTicker />
        <Pathways />
        <HowItWorks />
        <Growth />
        <BrandShowcase />
      </main>
      <SunshineFooter />
      <Suspense fallback={null}>
        <EntryPrompt />
      </Suspense>
    </>
  );
}

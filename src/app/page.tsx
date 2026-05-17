import { LandingNav } from "@/features/landing/components/nav";
import { Hero } from "@/features/landing/components/hero";
import { Comparison } from "@/features/landing/components/comparison";
import { UseCases } from "@/features/landing/components/use-cases";
import { Pricing } from "@/features/landing/components/pricing";
import { Footer } from "@/features/landing/components/footer";

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <LandingNav />
      <Hero />
      <Comparison />
      <UseCases />
      <Pricing />
      <Footer />
    </div>
  );
}

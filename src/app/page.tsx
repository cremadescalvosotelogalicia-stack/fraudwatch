import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  HeroSection,
  HowItWorksSection,
  FeaturesSection,
  SecuritySection,
  CTASection,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <SecuritySection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

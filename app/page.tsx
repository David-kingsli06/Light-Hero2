import { HeroSection } from "@/components/hero/HeroSection";

export default function Home() {
  return (
    <main className="bg-black text-white selection:bg-white selection:text-black">
      {/* Full-screen scroll-controlled Hero Section only */}
      <HeroSection />
    </main>
  );
}

"use client";

import { useRef, useEffect, useState } from "react";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { FrameCanvas } from "@/components/hero/FrameCanvas";
import { getFrameUrl } from "@/components/hero/constants";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check user motion preferences for accessibility
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Frame preloader hook
  const { images, loadProgress, isFirstFrameReady, isFullyLoaded } = useFramePreloader();

  // Scroll progress hook with Emil Kowalski-calibrated lerp smoothing
  const { smoothProgress, rawProgress, hasScrolled } = useScrollProgress(containerRef, {
    lerpFactor: 0.06,
  });

  const posterFrameUrl = getFrameUrl(0);

  // Calculate phase opacities and subtle translates for overlay layers
  // Text 1 (Hero Title & Intro): visible from 0 to 0.35, fading out by 0.40
  const titleOpacity = Math.max(0, Math.min(1, (0.32 - smoothProgress) / 0.12));
  const titleTranslateY = (smoothProgress / 0.32) * -24; // Subtle float upward as you scrub

  // Text 2 (Midpoint reveal): emerges between 0.38 and 0.68
  const midOpacity =
    smoothProgress < 0.35
      ? 0
      : smoothProgress <= 0.52
      ? Math.min(1, (smoothProgress - 0.35) / 0.1)
      : Math.max(0, (0.7 - smoothProgress) / 0.1);
  const midTranslateY = (1 - (smoothProgress - 0.35) / 0.35) * 16;

  // Text 3 (Finale / Climax CTA): emerges after 0.72 to 1.0
  const endOpacity = Math.max(0, Math.min(1, (smoothProgress - 0.72) / 0.12));
  const endTranslateY = Math.max(0, (1 - (smoothProgress - 0.72) / 0.28) * 16);

  // Scroll indicator opacity: hides immediately when scrolling begins or rawProgress > 0.03
  const scrollIndicatorOpacity = hasScrolled || rawProgress > 0.03 ? 0 : 1;

  // If the user prefers reduced motion, render a clean static version without 600vh scroll scrub
  if (prefersReducedMotion) {
    return (
      <section
        className="relative w-full min-h-screen flex items-center justify-center bg-black text-white px-6 py-20 overflow-hidden"
        aria-label="Hero section"
      >
        <div className="absolute inset-0 z-0">
          <img
            src={posterFrameUrl}
            alt="Cinematic lighting showcase"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono uppercase tracking-widest text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Luminescence Engine
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-balance text-zinc-100">
            Form sculpted by <span className="font-semibold text-white">pure light</span>.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Experience the uninterrupted choreography of illumination across space and precision surfaces.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#explore"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-zinc-950 font-medium text-sm tracking-wide transition-all duration-200 hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              Explore Collection
            </a>
            <a
              href="#specs"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium text-sm tracking-wide transition-all duration-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Specifications
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[1000vh] bg-black"
      aria-label="Scroll-controlled interactive hero experience"
    >
      {/* Sticky Full-Viewport Hero Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Background Visual Layer: Canvas or Poster */}
        <div className="absolute inset-0 z-0">
          <FrameCanvas
            progress={smoothProgress}
            images={images}
            isFirstFrameReady={isFirstFrameReady}
            fallbackSrc={posterFrameUrl}
            className="w-full h-full"
          />

          {/* Emil-grade subtle ambient scrims for impeccable contrast and typography legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-black/50 pointer-events-none" />
        </div>

        {/* Global Minimal Navigation / Status Header */}
        <header className="relative z-20 w-full px-6 py-6 md:px-12 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-300 font-medium">
              LUX // 02
            </span>
          </div>

          {/* Minimal Preload Progress Pill */}
          {!isFullyLoaded && (
            <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Caching stream {Math.round(loadProgress * 100)}%</span>
            </div>
          )}

          <a
            href="#inquire"
            className="text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-colors duration-150 py-1 px-3 rounded border border-white/10 hover:border-white/30 backdrop-blur-sm"
          >
            Inquire
          </a>
        </header>

        {/* Dynamic Contextual Text Overlays linked to scroll progression */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 md:px-12 pointer-events-none">
          {/* Phase 1: Opening Statement */}
          <div
            className="max-w-4xl text-center space-y-6 transition-transform duration-75 ease-out"
            style={{
              opacity: titleOpacity,
              transform: `translateY(${titleTranslateY}px)`,
              pointerEvents: titleOpacity > 0.4 ? "auto" : "none",
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono uppercase tracking-widest text-zinc-300">
              <span>Sequence 01</span>
              <span className="text-zinc-500">•</span>
              <span>760 Optical Phases</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-balance text-zinc-100">
              Form sculpted by <span className="font-semibold text-white">pure light</span>.
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-xl mx-auto font-normal leading-relaxed text-balance">
              An unbroken journey of light evolving across architectural contours and high-precision surfaces.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#experience"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-zinc-950 font-medium text-sm tracking-wide shadow-lg hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all duration-200"
              >
                Experience Design
              </a>
            </div>
          </div>

          {/* Phase 2: Midpoint Reveal */}
          <div
            className="absolute max-w-3xl text-center space-y-4 transition-transform duration-75 ease-out"
            style={{
              opacity: midOpacity,
              transform: `translateY(${midTranslateY}px)`,
              pointerEvents: midOpacity > 0.4 ? "auto" : "none",
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono uppercase tracking-widest text-zinc-300">
              Continuous Refraction
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white">
              Every angle, <span className="italic font-normal">re-imagined</span>.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-zinc-300 max-w-lg mx-auto leading-relaxed">
              Dynamically reacting to every scroll increment with hardware-accelerated 24fps fidelity.
            </p>
          </div>

          {/* Phase 3: Finale CTA */}
          <div
            className="absolute max-w-3xl text-center space-y-6 transition-transform duration-75 ease-out"
            style={{
              opacity: endOpacity,
              transform: `translateY(${endTranslateY}px)`,
              pointerEvents: endOpacity > 0.4 ? "auto" : "none",
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono uppercase tracking-widest text-zinc-300">
              Culmination
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white">
              Engineering beyond boundaries.
            </h2>
            <p className="text-base sm:text-lg text-zinc-300 max-w-md mx-auto leading-relaxed">
              Discover how radiant illumination elevates contemporary architectural form.
            </p>
            <div className="pt-2">
              <a
                href="#order"
                className="inline-block px-9 py-4 rounded-full bg-white text-zinc-950 font-medium text-sm tracking-wide shadow-2xl hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all duration-200"
              >
                Request Access
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bar: Scroll scrub telemetry & animated scroll indicator */}
        <footer className="relative z-20 w-full px-6 py-6 md:px-12 flex items-end justify-between pointer-events-none">
          {/* Scroll progress numeric telemetry */}
          <div className="hidden sm:flex flex-col gap-1 text-[11px] font-mono text-zinc-400">
            <span>SEQUENCE // 760 FRAMES</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 ease-out"
                  style={{ width: `${Math.round(smoothProgress * 100)}%` }}
                />
              </div>
              <span className="text-white font-medium">{Math.round(smoothProgress * 100)}%</span>
            </div>
          </div>

          {/* Scroll Indicator: disappears naturally once user begins scrolling */}
          <div
            className="mx-auto sm:mx-0 flex flex-col items-center gap-2 text-zinc-400 transition-opacity duration-300 ease-out"
            style={{ opacity: scrollIndicatorOpacity }}
            aria-hidden={scrollIndicatorOpacity === 0}
          >
            <span className="text-[10px] font-mono tracking-widest uppercase">Scroll to explore</span>
            <div className="w-5 h-8 rounded-full border border-white/20 p-1 flex justify-center">
              <div className="w-1 h-2 rounded-full bg-white animate-bounce" />
            </div>
          </div>

          {/* Stage tracker pill */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span>STAGE</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium">
              0{Math.min(4, Math.floor(smoothProgress * 4) + 1)} / 04
            </span>
          </div>
        </footer>
      </div>
    </section>
  );
}

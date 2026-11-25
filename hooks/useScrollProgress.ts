"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export interface ScrollProgressOptions {
  /**
   * Linear interpolation damping factor (0 < factor <= 1).
   * A value like 0.08 - 0.12 provides smooth physical momentum without noticeable lag.
   * Emil Kowalski motion guideline: damped exponential smoothing for buttery physics.
   */
  lerpFactor?: number;
}

export interface ScrollProgressState {
  /** Smoothed progress normalized between 0 and 1 */
  smoothProgress: number;
  /** Raw immediate scroll progress normalized between 0 and 1 */
  rawProgress: number;
  /** Whether the user has initiated any scroll on the page */
  hasScrolled: boolean;
}

/**
 * Calculates scroll progress through a container element from 0 to 1,
 * applying frame-rate independent linear interpolation (lerp) smoothing
 * via requestAnimationFrame to eliminate scroll jank and stepped frame skips.
 */
export function useScrollProgress(
  containerRef: RefObject<HTMLElement | null>,
  options: ScrollProgressOptions = {}
): ScrollProgressState {
  const { lerpFactor = 0.1 } = options;

  const [state, setState] = useState<ScrollProgressState>({
    smoothProgress: 0,
    rawProgress: 0,
    hasScrolled: false,
  });

  // Keep references to animation values to avoid re-binding listeners
  const rawProgressRef = useRef<number>(0);
  const smoothProgressRef = useRef<number>(0);
  const hasScrolledRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const calculateRawProgress = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // Total scrollable distance inside the container
      const totalScrollable = rect.height - viewportHeight;

      if (totalScrollable <= 0) {
        rawProgressRef.current = 0;
        return;
      }

      // Distance the top of the container has moved past the viewport top
      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / totalScrollable, 0), 1);
      rawProgressRef.current = progress;

      if (!hasScrolledRef.current && progress > 0.005) {
        hasScrolledRef.current = true;
      }
    };

    // Animation loop for lerp smoothing
    const updateLerp = () => {
      const target = rawProgressRef.current;
      const current = smoothProgressRef.current;

      // Exponential damping
      const delta = target - current;
      if (Math.abs(delta) > 0.0001) {
        smoothProgressRef.current = current + delta * lerpFactor;
      } else {
        smoothProgressRef.current = target;
      }

      setState({
        smoothProgress: smoothProgressRef.current,
        rawProgress: rawProgressRef.current,
        hasScrolled: hasScrolledRef.current,
      });

      rafIdRef.current = requestAnimationFrame(updateLerp);
    };

    const handleScroll = () => {
      calculateRawProgress();
    };

    const handleResize = () => {
      calculateRawProgress();
    };

    // Initial calculation
    calculateRawProgress();
    rafIdRef.current = requestAnimationFrame(updateLerp);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [containerRef, lerpFactor]);

  return state;
}

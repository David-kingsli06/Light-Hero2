"use client";

import { useEffect, useRef, useState } from "react";
import { TOTAL_FRAMES, getFrameUrl } from "@/components/hero/constants";

export interface FramePreloaderState {
  /** Array of preloaded and decoded HTMLImageElement instances */
  images: HTMLImageElement[];
  /** Progress of loading from 0 to 1 */
  loadProgress: number;
  /** Whether the initial frame (frame 0) is ready to display immediately */
  isFirstFrameReady: boolean;
  /** Whether all 760 frames have been fully loaded and decoded */
  isFullyLoaded: boolean;
}

/**
 * Loads all 760 frames sequentially/in controlled concurrent batches.
 * Prioritizes frame 0 so the canvas can render the poster frame instantly without lag,
 * then background loads the remainder in order into a persistent array.
 * Never creates new Image objects during scrolling.
 */
export function useFramePreloader(): FramePreloaderState {
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isFirstFrameReady, setIsFirstFrameReady] = useState<boolean>(false);
  const [isFullyLoaded, setIsFullyLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    imagesRef.current = images;

    let loadedCount = 0;

    // Helper to load and decode a single frame
    const loadFrame = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();

        const onDone = () => {
          if (isCancelled) return;
          images[index] = img;
          loadedCount++;
          setLoadProgress(loadedCount / TOTAL_FRAMES);
          resolve(img);
        };

        img.onload = () => {
          if ("decode" in img) {
            img.decode().then(onDone).catch(onDone);
          } else {
            onDone();
          }
        };

        img.onerror = onDone;
        img.src = getFrameUrl(index);
      });
    };

    const startPreloading = async () => {
      // 1. Prioritize frame 0 for immediate first visual render
      await loadFrame(0);
      if (isCancelled) return;
      setIsFirstFrameReady(true);

      // 2. Concurrently load the rest in sliding batches of 6 images to maximize bandwidth
      // without overwhelming the browser connection pool or memory all at once.
      const CONCURRENCY = 6;
      let currentIndex = 1;

      const worker = async () => {
        while (currentIndex < TOTAL_FRAMES && !isCancelled) {
          const indexToLoad = currentIndex++;
          await loadFrame(indexToLoad);
        }
      };

      const workers = Array.from({ length: CONCURRENCY }, () => worker());
      await Promise.all(workers);

      if (!isCancelled) {
        setIsFullyLoaded(true);
      }
    };

    startPreloading();

    return () => {
      isCancelled = true;
      // Release image references on unmount
      imagesRef.current = [];
    };
  }, []);

  return {
    images: imagesRef.current,
    loadProgress,
    isFirstFrameReady,
    isFullyLoaded,
  };
}

"use client";

import { useEffect, useRef, memo } from "react";
import {
  TOTAL_FRAMES,
  FRAME_NATURAL_WIDTH,
  FRAME_NATURAL_HEIGHT,
} from "@/components/hero/constants";

interface FrameCanvasProps {
  /** Smoothed progress normalized between 0 and 1 */
  progress: number;
  /** Array of preloaded Image objects */
  images: HTMLImageElement[];
  /** Whether the first frame is ready */
  isFirstFrameReady: boolean;
  /** Fallback poster image URL */
  fallbackSrc: string;
  className?: string;
}

/**
 * FrameCanvas component responsible for high-performance rendering:
 * 1. Sizes canvas accurately to window size * DPR (devicePixelRatio capped at 2 to conserve GPU memory).
 * 2. Emulates CSS object-fit: cover inside canvas 2d context (scales to cover, centered).
 * 3. Keeps track of the last rendered frame index and only triggers redraws when the discrete frame changes.
 * 4. Gracefully cleans up event listeners and handles window resize / orientation changes.
 */
export const FrameCanvas = memo(function FrameCanvas({
  progress,
  images,
  isFirstFrameReady,
  fallbackSrc,
  className = "",
}: FrameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnFrameRef = useRef<number>(-1);
  const imagesRef = useRef<HTMLImageElement[]>(images);
  imagesRef.current = images;

  // Render a specific frame index to the canvas with object-fit: cover scaling
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Find the closest available image if this exact index hasn't decoded yet
    let img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Find the nearest available frame backwards, fallback to 0
      for (let i = frameIndex - 1; i >= 0; i--) {
        if (imagesRef.current[i]?.complete && imagesRef.current[i].naturalWidth > 0) {
          img = imagesRef.current[i];
          break;
        }
      }
      if (!img || !img.complete) {
        img = imagesRef.current[0];
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.naturalWidth || FRAME_NATURAL_WIDTH;
    const imgHeight = img.naturalHeight || FRAME_NATURAL_HEIGHT;

    // Emulate object-fit: cover
    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const renderWidth = imgWidth * scale;
    const renderHeight = imgHeight * scale;
    const offsetX = (canvasWidth - renderWidth) / 2;
    const offsetY = (canvasHeight - renderHeight) / 2;

    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    lastDrawnFrameRef.current = frameIndex;
  };

  // Resize canvas to match display size multiplied by devicePixelRatio (capped at 2)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      const newWidth = Math.floor(displayWidth * dpr);
      const newHeight = Math.floor(displayHeight * dpr);

      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        // Redraw current frame immediately after size change
        if (lastDrawnFrameRef.current >= 0) {
          drawFrame(lastDrawnFrameRef.current);
        }
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // Update canvas when progress or first-frame readiness changes
  useEffect(() => {
    if (!isFirstFrameReady) return;

    // Map normalized scroll progress (0..1) to frame index (0..759)
    const targetFrame = Math.min(
      Math.max(Math.floor(progress * (TOTAL_FRAMES - 1)), 0),
      TOTAL_FRAMES - 1
    );

    // Only redraw when the target discrete frame index has changed
    if (targetFrame !== lastDrawnFrameRef.current) {
      drawFrame(targetFrame);
    }
  }, [progress, isFirstFrameReady]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block select-none pointer-events-none"
        aria-hidden="true"
      >
        {/* Fallback for browsers without canvas support */}
        <img
          src={fallbackSrc}
          alt="Visual sequence poster showing dynamic illumination"
          className="w-full h-full object-cover"
        />
      </canvas>
    </div>
  );
});

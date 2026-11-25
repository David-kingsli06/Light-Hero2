/**
 * Total frame configuration across the 4 stages.
 * 190 frames per stage, 4 stages = 760 frames total (indices 0 to 759).
 */
export const STAGE_FRAME_COUNT = 190;
export const STAGE_COUNT = 4;
export const TOTAL_FRAMES = STAGE_FRAME_COUNT * STAGE_COUNT; // 760

export const FRAME_NATURAL_WIDTH = 1280;
export const FRAME_NATURAL_HEIGHT = 720;

/**
 * Returns the public URL for a given continuous frame index (0..759).
 * stage1: 0..189 -> /frames/stage1/frame_0000.webp ... frame_0189.webp
 * stage2: 190..379 -> /frames/stage2/frame_0000.webp ... frame_0189.webp
 * stage3: 380..569 -> /frames/stage3/frame_0000.webp ... frame_0189.webp
 * stage4: 570..759 -> /frames/stage4/frame_0000.webp ... frame_0189.webp
 */
export function getFrameUrl(continuousIndex: number): string {
  const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(continuousIndex)));
  const stageNumber = Math.floor(clamped / STAGE_FRAME_COUNT) + 1;
  const localIndex = clamped % STAGE_FRAME_COUNT;
  const paddedIndex = localIndex.toString().padStart(4, "0");
  return `/frames/stage${stageNumber}/frame_${paddedIndex}.webp`;
}

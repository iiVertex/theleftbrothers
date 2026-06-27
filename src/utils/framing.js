// Framing geometry — the single source of truth for how a reel's media is laid
// out inside a frame (the full screen at playback, or the preview box during
// upload). A reel stores a focal point (`focusX`/`focusY`, each 0..1) and a fit
// mode; this helper turns those + the media aspect ratio into concrete pixel
// dimensions and a translation so the same crop is reproduced everywhere.
//
// `aspectRatio` is mediaWidth / mediaHeight. focusX=0 shows the left edge,
// focusX=1 the right edge, 0.5 centers (same idea vertically with focusY).

/**
 * Cover layout: the media is scaled to *fill* the frame (no empty space), then
 * shifted so the chosen focal point sits in view. Returns the media's rendered
 * size plus the translate needed to honor the focal point.
 *
 * @returns { width, height, translateX, translateY }
 */
export const computeCoverFraming = ({ aspectRatio, focusX = 0.5, focusY = 0.5, frameW, frameH }) => {
  // Without a known aspect ratio we can't size the media ourselves; the caller
  // should fall back to a plain cover fit.
  if (!aspectRatio || !isFinite(aspectRatio) || aspectRatio <= 0) {
    return { width: frameW, height: frameH, translateX: 0, translateY: 0 };
  }

  const frameAspect = frameW / frameH;
  let width;
  let height;
  if (aspectRatio > frameAspect) {
    // Media is wider than the frame → match height, overflow horizontally.
    height = frameH;
    width = frameH * aspectRatio;
  } else {
    // Media is taller/narrower → match width, overflow vertically.
    width = frameW;
    height = frameW / aspectRatio;
  }

  const overflowX = width - frameW;
  const overflowY = height - frameH;
  // focus 0 → show the leading edge (no shift); focus 1 → show the trailing edge.
  const translateX = -overflowX * clamp01(focusX);
  const translateY = -overflowY * clamp01(focusY);
  return { width, height, translateX, translateY };
};

/**
 * Contain layout: the whole media is visible, letterboxed inside the frame.
 * Returns the centered rendered size (callers place a blurred fill behind it).
 *
 * @returns { width, height }
 */
export const computeContainFraming = ({ aspectRatio, frameW, frameH }) => {
  if (!aspectRatio || !isFinite(aspectRatio) || aspectRatio <= 0) {
    return { width: frameW, height: frameH };
  }
  const frameAspect = frameW / frameH;
  if (aspectRatio > frameAspect) {
    // Wider than frame → full width, bars top/bottom.
    return { width: frameW, height: frameW / aspectRatio };
  }
  // Taller than frame → full height, bars left/right.
  return { width: frameH * aspectRatio, height: frameH };
};

const clamp01 = (v) => Math.max(0, Math.min(1, v));

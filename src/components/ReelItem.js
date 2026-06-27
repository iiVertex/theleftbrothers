import React from 'react';
import ReelVideoItem from './ReelVideoItem';
import ReelImageAudioItem from './ReelImageAudioItem';

/**
 * A single full-screen reel. Dispatches to the right media backend based on the
 * reel's `media_type`:
 *  - 'image_audio' → still image + audio track
 *  - 'video' (default, incl. legacy rows) → video player
 *
 * Both backends share the same chrome (ReelOverlay) and framing math
 * (src/utils/framing.js).
 */
export default function ReelItem({ item, isActive }) {
  if (item.media_type === 'image_audio') {
    return <ReelImageAudioItem item={item} isActive={isActive} />;
  }
  return <ReelVideoItem item={item} isActive={isActive} />;
}

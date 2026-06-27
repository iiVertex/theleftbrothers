// Local video storage helpers.
//
// Reel video *bytes* live on the device (offline, instant, private, no egress
// cost). Reel *metadata* still lives in Supabase `reels`, where `video_url`
// holds either:
//   • a relative name we own, e.g. "reels/1700000000000-ab12.mp4"
//     (new local videos — resolved against documentDirectory at play time), or
//   • an absolute URI containing "://" (legacy Supabase public URLs, or web
//     blob URLs) — used as-is.
//
// We deliberately store the *relative* name, never the absolute documentDirectory
// path: on iOS that path contains a container UUID that changes across app
// updates/reinstalls, which would silently break every saved video.

import * as FileSystem from 'expo-file-system/legacy';

const REELS_SUBDIR = 'reels';
const IMAGES_SUBDIR = 'images';
const AUDIO_SUBDIR = 'audio';

// True for anything already playable as-is (http(s), file, content, blob URIs).
const isAbsoluteUri = (value) => typeof value === 'string' && value.includes('://');

// Ensure an on-device media subdirectory exists. No-op on platforms without a
// document directory (e.g. web).
const ensureSubdir = async (subdir) => {
  const base = FileSystem.documentDirectory;
  if (!base) return null;
  const dir = `${base}${subdir}`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
};

/**
 * Copy a picked/recorded media file into persistent app storage.
 *
 * @returns the value to persist (e.g. in `reels.video_url`/`image_url`/`audio_url`):
 *   • native: a relative name like "<subdir>/<id>.<ext>"
 *   • web (no filesystem): the source URI unchanged (absolute, played in-session)
 */
const saveMediaLocally = async (srcUri, mime, subdir, fallbackExt) => {
  // No persistent filesystem (web): fall back to the source URI as-is.
  if (!FileSystem.documentDirectory) return srcUri;

  await ensureSubdir(subdir);
  const ext = (mime?.split('/')[1] || fallbackExt).toLowerCase();
  const name = `${subdir}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await FileSystem.copyAsync({ from: srcUri, to: `${FileSystem.documentDirectory}${name}` });
  return name;
};

export const saveVideoLocally = (srcUri, mime) => saveMediaLocally(srcUri, mime, REELS_SUBDIR, 'mp4');

export const saveImageLocally = (srcUri, mime) => saveMediaLocally(srcUri, mime, IMAGES_SUBDIR, 'jpg');

export const saveAudioLocally = (srcUri, mime) => saveMediaLocally(srcUri, mime, AUDIO_SUBDIR, 'mp3');

/**
 * Turn a stored `video_url` into a playable URI.
 * Absolute URIs (legacy cloud URLs, web blobs) pass through; relative names are
 * resolved against the current documentDirectory.
 */
export const resolveVideoUri = (stored) => {
  if (!stored) return stored;
  if (isAbsoluteUri(stored)) return stored;
  return `${FileSystem.documentDirectory || ''}${stored}`;
};

/**
 * Whether a stored video is expected to exist on *this* device. Relative names
 * may be missing if the row synced from another device; absolute URIs are
 * assumed reachable. Returns true on web (no getInfoAsync semantics to rely on).
 */
export const localVideoExists = async (stored) => {
  if (!stored || isAbsoluteUri(stored) || !FileSystem.documentDirectory) return true;
  try {
    const info = await FileSystem.getInfoAsync(resolveVideoUri(stored));
    return info.exists;
  } catch {
    return false;
  }
};

/**
 * Delete the on-device file backing a stored video, if we own it. Absolute URIs
 * (cloud/blob) are left alone. Safe to call unconditionally on delete.
 */
export const deleteLocalVideo = async (stored) => {
  if (!stored || isAbsoluteUri(stored) || !FileSystem.documentDirectory) return;
  try {
    await FileSystem.deleteAsync(resolveVideoUri(stored), { idempotent: true });
  } catch (error) {
    console.warn('[videoStorage] failed to delete local file', error);
  }
};

import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions,
  Image, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { COLORS, FONTS } from '../constants/theme';
import { computeCoverFraming, computeContainFraming } from '../utils/framing';

const { width: screenW, height: screenH } = Dimensions.get('window');
const SCREEN_ASPECT = screenW / screenH;

// Preview box mimics the phone screen's aspect ratio so the crop the user picks
// here is exactly what they'll see in the full-screen reel.
const PREVIEW_H = Math.min(screenH * 0.56, 460);
const PREVIEW_W = PREVIEW_H * SCREEN_ASPECT;

const clamp01 = (v) => Math.max(0, Math.min(1, v));

/**
 * Lets the uploader pick which part of a video/image is visible in the reel.
 * The media fills a phone-shaped box; dragging pans the focal point. A
 * "Show whole" toggle switches to a contained (letterboxed) fit instead.
 *
 * Props:
 *  - visible
 *  - mediaType: 'video' | 'image'
 *  - uri: playable/displayable source for the picked media
 *  - aspectRatio: mediaWidth / mediaHeight
 *  - initial: optional { display_fit, focus_x, focus_y }
 *  - onCancel()
 *  - onDone({ display_fit, focus_x, focus_y })
 */
export default function FramingModal({ visible, mediaType, uri, aspectRatio, initial, onCancel, onDone }) {
  const [fit, setFit] = useState(initial?.display_fit || 'cover');
  const [focusX, setFocusX] = useState(initial?.focus_x ?? 0.5);
  const [focusY, setFocusY] = useState(initial?.focus_y ?? 0.5);

  // Muted, looping preview player (only used for video; null source for images).
  const player = useVideoPlayer(mediaType === 'video' ? uri : null, (p) => {
    if (!p) return;
    p.loop = true;
    p.muted = true;
    try { p.play(); } catch {}
  });

  const cover = useMemo(
    () => computeCoverFraming({ aspectRatio, focusX, focusY, frameW: PREVIEW_W, frameH: PREVIEW_H }),
    [aspectRatio, focusX, focusY]
  );
  const contain = useMemo(
    () => computeContainFraming({ aspectRatio, frameW: PREVIEW_W, frameH: PREVIEW_H }),
    [aspectRatio]
  );

  const overflowX = Math.max(0, cover.width - PREVIEW_W);
  const overflowY = Math.max(0, cover.height - PREVIEW_H);
  const canPan = fit === 'cover' && (overflowX > 1 || overflowY > 1);

  // Refs so the (stable) pan handler always reads the latest focal point / geometry.
  const focusXRef = useRef(focusX);
  const focusYRef = useRef(focusY);
  focusXRef.current = focusX;
  focusYRef.current = focusY;
  const startFocus = useRef({ x: focusX, y: focusY });
  const geo = useRef({ overflowX, overflowY });
  geo.current = { overflowX, overflowY };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startFocus.current = { x: focusXRef.current, y: focusYRef.current };
      },
      onPanResponderMove: (_, g) => {
        const { overflowX: ox, overflowY: oy } = geo.current;
        // Dragging the media right reveals its left side → focus decreases.
        if (ox > 1) setFocusX(clamp01(startFocus.current.x - g.dx / ox));
        if (oy > 1) setFocusY(clamp01(startFocus.current.y - g.dy / oy));
      },
    })
  ).current;

  const renderMedia = (style, contentFit) => {
    if (mediaType === 'video') {
      return <VideoView player={player} style={style} contentFit={contentFit} nativeControls={false} />;
    }
    return <Image source={{ uri }} style={style} resizeMode={contentFit} />;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adjust Framing</Text>
          <TouchableOpacity onPress={() => onDone({ display_fit: fit, focus_x: focusX, focus_y: focusY })} style={styles.headerBtn}>
            <Ionicons name="checkmark" size={26} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          {fit === 'cover'
            ? (canPan ? 'Drag to choose the visible part' : 'This media already fits the screen')
            : 'The whole media is shown, with a blurred background'}
        </Text>

        <View style={styles.previewWrap}>
          <View style={styles.frame} {...(canPan ? panResponder.panHandlers : {})}>
            {fit === 'cover' ? (
              renderMedia(
                {
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: cover.width,
                  height: cover.height,
                  transform: [{ translateX: cover.translateX }, { translateY: cover.translateY }],
                },
                'cover'
              )
            ) : (
              <>
                {/* Blurred fill (images only in the preview; video shows on black). */}
                {mediaType === 'image' && (
                  <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={20} />
                )}
                <View style={StyleSheet.absoluteFill}>
                  <View style={styles.containCenter}>
                    {renderMedia({ width: contain.width, height: contain.height }, 'contain')}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.toggle, fit === 'cover' && styles.toggleActive]}
            onPress={() => setFit('cover')}
          >
            <Ionicons name="crop-outline" size={18} color={fit === 'cover' ? COLORS.black : COLORS.white} />
            <Text style={[styles.toggleText, fit === 'cover' && styles.toggleTextActive]}>Fill screen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, fit === 'contain' && styles.toggleActive]}
            onPress={() => setFit('contain')}
          >
            <Ionicons name="scan-outline" size={18} color={fit === 'contain' ? COLORS.black : COLORS.white} />
            <Text style={[styles.toggleText, fit === 'contain' && styles.toggleTextActive]}>Show whole</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', letterSpacing: FONTS.tracking.wide, textTransform: 'uppercase' },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  previewWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: PREVIEW_W,
    height: PREVIEW_H,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  containCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  controls: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 44,
    paddingTop: 16,
  },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  toggleActive: { backgroundColor: COLORS.white, borderColor: COLORS.white },
  toggleText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  toggleTextActive: { color: COLORS.black },
});

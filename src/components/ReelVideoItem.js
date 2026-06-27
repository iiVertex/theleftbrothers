import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { BlurView } from 'expo-blur';
import { COLORS } from '../constants/theme';
import { resolveVideoUri, localVideoExists } from '../utils/videoStorage';
import { computeCoverFraming, computeContainFraming } from '../utils/framing';
import ReelOverlay from './ReelOverlay';

const { width, height } = Dimensions.get('window');

/**
 * A single full-screen *video* reel. Playback is driven imperatively off
 * `isActive` so a reel always restarts from 0 when it becomes active.
 *
 * Framing honors the reel's stored `display_fit` + focal point:
 *  - 'cover'  : media fills the screen, panned to the chosen focal point.
 *  - 'contain': whole video shown, letterboxed over a blurred copy of itself
 *               (its own background player — Android can't share one player
 *               across two VideoViews).
 */
export default function ReelVideoItem({ item, isActive }) {
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const isContain = item.display_fit === 'contain';
  const uri = resolveVideoUri(item.video_url);

  useEffect(() => {
    let cancelled = false;
    setUnavailable(false);
    localVideoExists(item.video_url).then((exists) => {
      if (!cancelled) setUnavailable(!exists);
    });
    return () => { cancelled = true; };
  }, [item.video_url]);

  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  const isScrubbingRef = useRef(false);
  isScrubbingRef.current = isScrubbing;

  // Main player (carries audio). Loops; emits time updates ~8×/sec.
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.timeUpdateEventInterval = 0.12;
  });

  // Blurred-fill background player — only loaded for 'contain' reels.
  const bgPlayer = useVideoPlayer(isContain ? uri : null, (p) => {
    if (!p) return;
    p.loop = true;
    p.muted = true;
  });

  // Mirror playback state + progress out of the imperative player into React.
  useEffect(() => {
    if (!player) return;
    const playing = player.addListener('playingChange', ({ isPlaying }) => setIsPlaying(isPlaying));
    const time = player.addListener('timeUpdate', ({ currentTime }) => {
      if (!isScrubbingRef.current) setPositionMillis(currentTime * 1000);
      if (player.duration) setDurationMillis(player.duration * 1000);
    });
    const status = player.addListener('statusChange', ({ status, error }) => {
      if (error) console.warn('[ReelVideoItem] playback error', uri, error);
      if (status === 'readyToPlay' && player.duration) setDurationMillis(player.duration * 1000);
    });
    return () => { playing.remove(); time.remove(); status.remove(); };
  }, [player, uri]);

  // Restart-on-revisit: the active reel plays from 0; inactive reels pause/rewind.
  useEffect(() => {
    if (!player) return;
    try {
      if (isActive && !unavailable) {
        player.currentTime = 0;
        player.play();
        if (bgPlayer) { bgPlayer.currentTime = 0; bgPlayer.play(); }
      } else {
        player.pause();
        player.currentTime = 0;
        setPositionMillis(0);
        if (bgPlayer) { bgPlayer.pause(); bgPlayer.currentTime = 0; }
      }
    } catch {}
  }, [isActive, unavailable, player, bgPlayer]);

  const cover = useMemo(
    () => computeCoverFraming({
      aspectRatio: item.aspect_ratio,
      focusX: item.focus_x,
      focusY: item.focus_y,
      frameW: width,
      frameH: height,
    }),
    [item.aspect_ratio, item.focus_x, item.focus_y]
  );
  const contain = useMemo(
    () => computeContainFraming({ aspectRatio: item.aspect_ratio, frameW: width, frameH: height }),
    [item.aspect_ratio]
  );

  const togglePause = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
      bgPlayer?.pause();
    } else {
      player.play();
      bgPlayer?.play();
    }
  };

  const onScrubStart = () => { setIsScrubbing(true); player?.pause(); };
  const onScrub = (seekMillis) => setPositionMillis(seekMillis);
  const onScrubEnd = (seekMillis) => {
    setPositionMillis(seekMillis);
    if (player) {
      try { player.currentTime = seekMillis / 1000; } catch {}
    }
    setIsScrubbing(false);
    if (isActiveRef.current && !unavailable) player?.play();
  };

  const renderMedia = () => {
    if (isContain) {
      return (
        <View style={StyleSheet.absoluteFill}>
          <VideoView player={bgPlayer} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.containCenter}>
            <VideoView
              player={player}
              style={{ width: contain.width, height: contain.height }}
              contentFit="contain"
              nativeControls={false}
            />
          </View>
        </View>
      );
    }
    // cover: pan to the focal point when we know the aspect ratio; otherwise
    // fall back to a plain cover fit (legacy rows).
    if (item.aspect_ratio) {
      return (
        <View style={[StyleSheet.absoluteFill, styles.clip]}>
          <VideoView
            player={player}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: cover.width,
              height: cover.height,
              transform: [{ translateX: cover.translateX }, { translateY: cover.translateY }],
            }}
            contentFit="cover"
            nativeControls={false}
          />
        </View>
      );
    }
    return (
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} allowsFullscreen={false} />
    );
  };

  return (
    <View style={styles.videoContainer}>
      {unavailable ? (
        <View style={[StyleSheet.absoluteFill, styles.unavailable]}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.subTextLight} />
          <Text style={styles.unavailableText}>Not available on this device</Text>
        </View>
      ) : (
        <>
          {renderMedia()}
          <ReelOverlay
            title={item.title}
            description={item.description}
            isPlaying={isPlaying}
            onTogglePause={togglePause}
            positionMillis={positionMillis}
            durationMillis={durationMillis}
            onScrubStart={onScrubStart}
            onScrub={onScrub}
            onScrubEnd={onScrubEnd}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: { width, height, backgroundColor: '#000' },
  clip: { overflow: 'hidden' },
  containCenter: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  unavailable: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#000',
  },
  unavailableText: {
    color: COLORS.subTextLight,
    fontSize: 14,
    fontWeight: '600',
  },
});

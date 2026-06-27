import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Pressable, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { COLORS } from '../constants/theme';
import { resolveVideoUri, localVideoExists } from '../utils/videoStorage';
import ReelScrubBar from './ReelScrubBar';

const { width, height } = Dimensions.get('window');

/**
 * A single full-screen reel: the video, the info/action overlay, an
 * Instagram-style scrub bar, and tap-to-pause.
 *
 * Uses the expo-video player (expo-av is deprecated in SDK 54). Playback is
 * driven imperatively off `isActive` so a reel always restarts from 0 whenever
 * it becomes the active item.
 */
export default function ReelItem({ item, isActive }) {
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  // Rows sync from Supabase, but locally-stored files only exist on the device
  // that saved them. Detect a missing file and show a placeholder instead of a
  // black, broken player.
  const [unavailable, setUnavailable] = useState(false);

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

  // expo-video player (replaces the deprecated expo-av Video). One player per
  // reel; loop forever and emit time updates ~8×/sec for the scrub bar.
  const player = useVideoPlayer(resolveVideoUri(item.video_url), (p) => {
    p.loop = true;
    p.timeUpdateEventInterval = 0.12;
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
      if (error) console.warn('[ReelItem] playback error', resolveVideoUri(item.video_url), error);
      if (status === 'readyToPlay' && player.duration) setDurationMillis(player.duration * 1000);
    });
    return () => { playing.remove(); time.remove(); status.remove(); };
  }, [player, item.video_url]);

  // Restart-on-revisit: the active reel plays from 0; inactive reels pause and
  // rewind so the next visit starts clean.
  useEffect(() => {
    if (!player) return;
    try {
      if (isActive && !unavailable) {
        player.currentTime = 0;
        player.play();
      } else {
        player.pause();
        player.currentTime = 0;
        setPositionMillis(0);
      }
    } catch {}
  }, [isActive, unavailable, player]);

  // Flash a centered play/pause icon on tap.
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const [flashIcon, setFlashIcon] = useState('play');

  const flash = (name) => {
    setFlashIcon(name);
    iconOpacity.setValue(1);
    Animated.timing(iconOpacity, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const togglePause = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
      flash('pause');
    } else {
      player.play();
      flash('play');
    }
  };

  const onScrubStart = () => {
    setIsScrubbing(true);
    player?.pause();
  };

  const onScrub = (seekMillis) => {
    setPositionMillis(seekMillis);
  };

  const onScrubEnd = (seekMillis) => {
    setPositionMillis(seekMillis);
    if (player) {
      try { player.currentTime = seekMillis / 1000; } catch {}
    }
    setIsScrubbing(false);
    if (isActiveRef.current && !unavailable) player?.play();
  };

  return (
    <View style={styles.videoContainer}>
      {/* Tap-to-pause sits below the scrub bar in the tree so the bar wins touches. */}
      {unavailable ? (
        <View style={[StyleSheet.absoluteFill, styles.unavailable]}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.subTextLight} />
          <Text style={styles.unavailableText}>Not available on this device</Text>
        </View>
      ) : (
        <>
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
            allowsFullscreen={false}
          />
          {/* Tap-to-pause overlay sits above the video but below the info/scrub
              layers (which come later in the tree) so those keep their touches. */}
          <Pressable style={StyleSheet.absoluteFill} onPress={togglePause} />
        </>
      )}

      {/* Tap feedback icon */}
      <Animated.View style={[styles.flashWrap, { opacity: iconOpacity }]} pointerEvents="none">
        <View style={styles.flashCircle}>
          <Ionicons name={flashIcon} size={44} color={COLORS.white} />
        </View>
      </Animated.View>

      <View style={styles.videoOverlay}>
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{item.title || 'Untitled'}</Text>
          {!!item.description && <Text style={styles.videoDescription}>{item.description}</Text>}
        </View>
        <View style={styles.videoActions}>
          <TouchableOpacity style={styles.actionIcon}><Ionicons name="heart" size={28} color={COLORS.white} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}><Ionicons name="share-social" size={28} color={COLORS.white} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}><Ionicons name="ellipsis-vertical" size={28} color={COLORS.white} /></TouchableOpacity>
        </View>
      </View>

      <View style={styles.scrubWrap}>
        <ReelScrubBar
          positionMillis={positionMillis}
          durationMillis={durationMillis}
          onScrubStart={onScrubStart}
          onScrub={onScrub}
          onScrubEnd={onScrubEnd}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: { width, height, backgroundColor: '#000' },
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
  flashWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
    paddingBottom: 20,
  },
  videoInfo: { flex: 1, marginRight: 20 },
  videoTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    textShadow: '0px 1px 8px rgba(0,0,0,0.6)',
  },
  videoDescription: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  videoActions: { alignItems: 'center' },
  actionIcon: { marginBottom: 20 },
  scrubWrap: {
    position: 'absolute',
    bottom: 6,
    left: 12,
    right: 12,
  },
});

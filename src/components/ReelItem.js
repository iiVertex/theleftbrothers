import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Pressable, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { COLORS } from '../constants/theme';
import ReelScrubBar from './ReelScrubBar';

const { width, height } = Dimensions.get('window');

/**
 * A single full-screen reel: the video, the info/action overlay, an
 * Instagram-style scrub bar, and tap-to-pause.
 *
 * Playback is driven imperatively (not via `shouldPlay`) so a reel always
 * restarts from 0 whenever it becomes the active item.
 */
export default function ReelItem({ item, isActive }) {
  const videoRef = useRef(null);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  // Flash a centered play/pause icon on tap.
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const [flashIcon, setFlashIcon] = useState('play');

  // Restart-on-revisit: when this reel becomes active, replay from 0;
  // when it leaves, pause and rewind so the next visit starts clean.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      setIsPaused(false);
      v.replayAsync().catch(() => {});
    } else {
      v.pauseAsync().catch(() => {});
      v.setPositionAsync(0).catch(() => {});
      setPositionMillis(0);
    }
  }, [isActive]);

  const onLoad = () => {
    setIsLoaded(true);
    // If this reel mounted while already active, the effect above may have run
    // before the video was ready — kick off playback now.
    if (isActiveRef.current) {
      setIsPaused(false);
      videoRef.current?.replayAsync().catch(() => {});
    }
  };

  const onStatus = (s) => {
    if (!s.isLoaded) return;
    if (!isScrubbing) {
      setPositionMillis(s.positionMillis || 0);
    }
    if (s.durationMillis) setDurationMillis(s.durationMillis);
  };

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
    const v = videoRef.current;
    if (!v) return;
    if (isPaused) {
      v.playAsync().catch(() => {});
      setIsPaused(false);
      flash('play');
    } else {
      v.pauseAsync().catch(() => {});
      setIsPaused(true);
      flash('pause');
    }
  };

  const onScrubStart = () => {
    setIsScrubbing(true);
    videoRef.current?.pauseAsync().catch(() => {});
  };

  const onScrub = (seekMillis) => {
    setPositionMillis(seekMillis);
  };

  const onScrubEnd = (seekMillis) => {
    const v = videoRef.current;
    setPositionMillis(seekMillis);
    setIsScrubbing(false);
    if (!v) return;
    v.setPositionAsync(seekMillis).catch(() => {});
    if (!isPaused) v.playAsync().catch(() => {});
  };

  return (
    <View style={styles.videoContainer}>
      {/* Tap-to-pause sits below the scrub bar in the tree so the bar wins touches. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={togglePause}>
        <Video
          ref={videoRef}
          source={{ uri: item.video_url }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          isLooping
          useNativeControls={false}
          progressUpdateIntervalMillis={120}
          onLoad={onLoad}
          onPlaybackStatusUpdate={onStatus}
        />
      </Pressable>

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

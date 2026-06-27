import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Pressable, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import ReelScrubBar from './ReelScrubBar';

/**
 * Shared reel chrome rendered on top of any media backend (video or
 * image+audio): tap-to-pause with a flashing icon, the title/description +
 * action column, and the scrub bar. Media is rendered by the parent *behind*
 * this overlay.
 */
export default function ReelOverlay({
  title,
  description,
  isPlaying,
  onTogglePause,
  positionMillis,
  durationMillis,
  onScrubStart,
  onScrub,
  onScrubEnd,
}) {
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const [flashIcon, setFlashIcon] = useState('play');

  const handleTap = () => {
    // Flash reflects the state we're switching *to*.
    const name = isPlaying ? 'pause' : 'play';
    setFlashIcon(name);
    iconOpacity.setValue(1);
    Animated.timing(iconOpacity, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
    onTogglePause && onTogglePause();
  };

  return (
    <>
      {/* Tap-to-pause overlay sits above the media but below the info/scrub
          layers (which come later in the tree) so those keep their touches. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleTap} />

      {/* Tap feedback icon */}
      <Animated.View style={[styles.flashWrap, { opacity: iconOpacity }]} pointerEvents="none">
        <View style={styles.flashCircle}>
          <Ionicons name={flashIcon} size={44} color={COLORS.white} />
        </View>
      </Animated.View>

      <View style={styles.videoOverlay}>
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{title || 'Untitled'}</Text>
          {!!description && <Text style={styles.videoDescription}>{description}</Text>}
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
    </>
  );
}

const styles = StyleSheet.create({
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

import React, { useRef, useState } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/**
 * Instagram-style scrub bar: a thin progress line that expands into a draggable
 * thumb while the user is touching it.
 *
 * Props:
 *  - positionMillis / durationMillis — current playback state
 *  - onScrubStart()          — fired when the user grabs the bar
 *  - onScrub(seekMillis)     — fired continuously while dragging
 *  - onScrubEnd(seekMillis)  — fired on release
 */
export default function ReelScrubBar({
  positionMillis = 0,
  durationMillis = 0,
  onScrubStart,
  onScrubEnd,
  onScrub,
}) {
  const [scrubbing, setScrubbing] = useState(false);
  const [dragMillis, setDragMillis] = useState(0);
  const barWidth = useRef(0);
  const durationRef = useRef(durationMillis);
  durationRef.current = durationMillis;

  const seekFromX = (x) => {
    const w = barWidth.current || 1;
    const ratio = clamp(x / w, 0, 1);
    return ratio * (durationRef.current || 0);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const seek = seekFromX(e.nativeEvent.locationX);
        setScrubbing(true);
        setDragMillis(seek);
        onScrubStart && onScrubStart();
        onScrub && onScrub(seek);
      },
      onPanResponderMove: (e) => {
        const seek = seekFromX(e.nativeEvent.locationX);
        setDragMillis(seek);
        onScrub && onScrub(seek);
      },
      onPanResponderRelease: (e) => {
        const seek = seekFromX(e.nativeEvent.locationX);
        setScrubbing(false);
        onScrubEnd && onScrubEnd(seek);
      },
      onPanResponderTerminate: (e) => {
        const seek = seekFromX(e.nativeEvent.locationX);
        setScrubbing(false);
        onScrubEnd && onScrubEnd(seek);
      },
    })
  ).current;

  const shown = scrubbing ? dragMillis : positionMillis;
  const ratio = durationMillis > 0 ? clamp(shown / durationMillis, 0, 1) : 0;
  const fillPct = `${ratio * 100}%`;

  return (
    <View
      style={styles.hitArea}
      onLayout={(e) => { barWidth.current = e.nativeEvent.layout.width; }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.track, scrubbing && styles.trackActive]}>
        <View style={[styles.fill, { width: fillPct }, scrubbing && styles.fillActive]} />
      </View>
      {scrubbing && (
        <View style={[styles.thumb, { left: fillPct }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Generous vertical hit area so the thin line is easy to grab.
  hitArea: {
    width: '100%',
    height: 28,
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  trackActive: {
    height: 6,
    borderRadius: 3,
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.white,
  },
  fillActive: {
    backgroundColor: COLORS.white,
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.white,
    marginLeft: -7,
    top: '50%',
    marginTop: -7,
  },
});

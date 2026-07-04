import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { COLORS } from '../constants/theme';
import { resolveVideoUri, localVideoExists } from '../utils/videoStorage';
import { computeCoverFraming, computeContainFraming } from '../utils/framing';
import ReelOverlay from './ReelOverlay';

const { width, height } = Dimensions.get('window');

/**
 * A single full-screen *image + audio* reel: a still image (framed like a video
 * reel) with its audio track played via expo-av, looped and synced to
 * `isActive`. The scrub bar seeks the audio.
 */
export default function ReelImageAudioItem({ item, isActive, pageWidth = width, pageHeight = height }) {
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const isContain = item.display_fit === 'contain';
  const imageUri = resolveVideoUri(item.image_url);
  const audioUri = resolveVideoUri(item.audio_url);

  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  const isScrubbingRef = useRef(false);
  isScrubbingRef.current = isScrubbing;
  const soundRef = useRef(null);

  // Allow audio to play even when the device is on silent (iOS).
  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
  }, []);

  // Both files must exist on this device.
  useEffect(() => {
    let cancelled = false;
    setUnavailable(false);
    Promise.all([localVideoExists(item.image_url), localVideoExists(item.audio_url)])
      .then(([img, aud]) => { if (!cancelled) setUnavailable(!(img && aud)); });
    return () => { cancelled = true; };
  }, [item.image_url, item.audio_url]);

  const onStatus = (status) => {
    if (!status.isLoaded) return;
    if (!isScrubbingRef.current) setPositionMillis(status.positionMillis || 0);
    if (status.durationMillis) setDurationMillis(status.durationMillis);
    setIsPlaying(status.isPlaying);
  };

  // Load / unload the audio for this reel.
  useEffect(() => {
    if (unavailable) return;
    let mounted = true;
    let sound;
    (async () => {
      try {
        const { sound: s } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { isLooping: true, shouldPlay: false },
          onStatus
        );
        if (!mounted) { s.unloadAsync(); return; }
        sound = s;
        soundRef.current = s;
        if (isActiveRef.current) {
          try { await s.setPositionAsync(0); await s.playAsync(); } catch {}
        }
      } catch (e) {
        console.warn('[ReelImageAudioItem] audio load error', audioUri, e);
      }
    })();
    return () => {
      mounted = false;
      soundRef.current = null;
      if (sound) sound.unloadAsync();
    };
  }, [audioUri, unavailable]);

  // Play the active reel from 0; pause + rewind inactive reels.
  useEffect(() => {
    const s = soundRef.current;
    if (!s) return;
    (async () => {
      try {
        if (isActive && !unavailable) {
          await s.setPositionAsync(0);
          await s.playAsync();
        } else {
          await s.pauseAsync();
          await s.setPositionAsync(0);
          setPositionMillis(0);
        }
      } catch {}
    })();
  }, [isActive, unavailable]);

  const cover = useMemo(
    () => computeCoverFraming({
      aspectRatio: item.aspect_ratio,
      focusX: item.focus_x,
      focusY: item.focus_y,
      frameW: pageWidth,
      frameH: pageHeight,
    }),
    [item.aspect_ratio, item.focus_x, item.focus_y, pageWidth, pageHeight]
  );
  const contain = useMemo(
    () => computeContainFraming({ aspectRatio: item.aspect_ratio, frameW: pageWidth, frameH: pageHeight }),
    [item.aspect_ratio, pageWidth, pageHeight]
  );

  const togglePause = async () => {
    const s = soundRef.current;
    if (!s) return;
    try {
      if (isPlaying) await s.pauseAsync();
      else await s.playAsync();
    } catch {}
  };

  const onScrubStart = () => { setIsScrubbing(true); soundRef.current?.pauseAsync().catch(() => {}); };
  const onScrub = (seekMillis) => setPositionMillis(seekMillis);
  const onScrubEnd = (seekMillis) => {
    setPositionMillis(seekMillis);
    soundRef.current?.setPositionAsync(seekMillis).catch(() => {});
    setIsScrubbing(false);
    if (isActiveRef.current && !unavailable) soundRef.current?.playAsync().catch(() => {});
  };

  const renderMedia = () => {
    if (isContain) {
      return (
        <View style={StyleSheet.absoluteFill}>
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={20} />
          <View style={styles.containCenter}>
            <Image source={{ uri: imageUri }} style={{ width: contain.width, height: contain.height }} resizeMode="contain" />
          </View>
        </View>
      );
    }
    if (item.aspect_ratio) {
      return (
        <View style={[StyleSheet.absoluteFill, styles.clip]}>
          <Image
            source={{ uri: imageUri }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: cover.width,
              height: cover.height,
              transform: [{ translateX: cover.translateX }, { translateY: cover.translateY }],
            }}
            resizeMode="cover"
          />
        </View>
      );
    }
    return <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />;
  };

  return (
    <View style={[styles.videoContainer, { width: pageWidth, height: pageHeight }]}>
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
  videoContainer: { backgroundColor: '#000' },
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

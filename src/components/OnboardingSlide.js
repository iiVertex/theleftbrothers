import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';

// Total dots across the intro flow: Initial screen + 4 feature slides.
const DOT_COUNT = 5;
// Number of numbered feature slides (used for the "01 / 04" label).
const SLIDE_COUNT = 4;

/**
 * Shared layout for the four onboarding feature slides (P1–P4).
 *
 * @param index       1-based slide number (1–4)
 * @param title       bold heading
 * @param subtitle    grey supporting line
 * @param illustration  require()'d image source
 * @param onNext      advance handler (circular arrow button)
 * @param onSkip      skip handler (top-right)
 */
export default function OnboardingSlide({ index, title, subtitle, illustration, onNext, onSkip }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Top bar — page number + Skip */}
      <View style={styles.topBar}>
        <Text style={styles.pageNumber}>
          0{index}
          <Text style={styles.pageNumberMuted}> / 0{SLIDE_COUNT}</Text>
        </Text>
        <TouchableOpacity onPress={onSkip} hitSlop={10}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Heading */}
      <View style={styles.headingBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationWrap}>
        <Image source={illustration} style={styles.illustration} resizeMode="contain" />
      </View>

      {/* Bottom bar — dots + next arrow */}
      <View style={styles.bottomBar}>
        <View style={styles.dots}>
          {Array.from({ length: DOT_COUNT }).map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={onNext} activeOpacity={0.85}>
          <Ionicons name="arrow-forward" size={24} color={COLORS.bg1} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg1,
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text1,
    letterSpacing: 1,
  },
  pageNumberMuted: { color: COLORS.subTextLight, fontWeight: '600' },
  skipText: { fontSize: 14, fontWeight: '600', color: COLORS.subText },

  headingBlock: { marginTop: 36 },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 34,
    color: COLORS.text1,
    lineHeight: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.subText,
    fontWeight: '500',
  },

  illustrationWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: { width: '100%', height: '100%' },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: COLORS.accent,
  },
  nextButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

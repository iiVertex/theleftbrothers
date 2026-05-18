import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { setOnboardingComplete } from '../utils/onboarding';

const LOGO = require('../../assets/onboarding/logo.png');

export default function Onboarding1Screen({ navigation }) {
  const skip = async () => {
    await setOnboardingComplete();
    navigation.replace('AuthChoice');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.brandText}>RotSmart</Text>
        </View>

        <View style={styles.spacer} />

        <Text style={styles.heading}>Learn.{'\n'}Organise.{'\n'}Rot.{'\n'}Remember.</Text>
        <Text style={styles.body}>
          Your second brain for short-form learning — capture it, keep it, never lose it.
        </Text>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => navigation.navigate('Onboarding2')}
          activeOpacity={0.85}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.bg1} />
        </TouchableOpacity>

        <View style={styles.dotsRow}>
          <View style={styles.dots}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
            ))}
          </View>
          <TouchableOpacity onPress={skip} hitSlop={10}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg1 },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 40,
  },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 22, height: 22 },
  brandText: {
    fontFamily: FONTS.serifBold,
    fontSize: 19,
    color: COLORS.text1,
  },

  heading: {
    fontFamily: FONTS.serifBlack,
    fontSize: 48,
    lineHeight: 54,
    color: COLORS.text1,
    marginBottom: 16,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.subText,
    fontWeight: '500',
    maxWidth: '88%',
  },

  spacer: { flex: 1, minHeight: 24 },

  getStartedButton: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bg1,
    letterSpacing: 0.2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
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
  skipText: { fontSize: 14, fontWeight: '600', color: COLORS.subText },
});

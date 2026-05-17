import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, ImageBackground,
} from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');
const BG_IMAGE = require('../../assets/onboarding1_bg.jpg');

export default function Onboarding1Screen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.imageWrapper}>
        <ImageBackground source={BG_IMAGE} style={styles.backgroundImage} resizeMode="cover">
          <View style={styles.titleOverlay}>
            <Text style={styles.titleText}>ReelsVault</Text>
            <Text style={styles.titleSub}>Save. Organize. Discover.</Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.pagination}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('Onboarding2')}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg1 },
  imageWrapper: {
    flex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  titleOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
    paddingBottom: 36,
  },
  titleText: {
    fontFamily: FONTS.serifBlack,
    fontSize: 42,
    color: COLORS.white,
    letterSpacing: 0,
    marginBottom: 6,
  },
  titleSub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  bottomSection: {
    paddingBottom: 44,
    paddingTop: 24,
    paddingHorizontal: 24,
    backgroundColor: COLORS.bg1,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  continueButton: {
    width: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bg1,
    letterSpacing: 0.2,
  },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 14, color: COLORS.subText, fontWeight: '600' },
});

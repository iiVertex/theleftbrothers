import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, ImageBackground,
} from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const BG_IMAGE = require('../../assets/onboarding1_bg.jpg');

export default function Onboarding2Screen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.imageWrapper}>
        <ImageBackground source={BG_IMAGE} style={styles.backgroundImage} resizeMode="cover">
          <View style={styles.textOverlay}>
            <Text style={styles.headingText}>Study Smarter,</Text>
            <Text style={styles.headingText}>Recall Faster.</Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('SignIn')}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.signUpBtn}>
          <Text style={styles.signUpText}>Create an account</Text>
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
  textOverlay: {
    marginTop: height * 0.12,
    paddingHorizontal: 28,
  },
  headingText: {
    fontFamily: FONTS.serifBold,
    fontSize: 36,
    color: COLORS.white,
    letterSpacing: 0,
    marginBottom: 4,
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
  signUpBtn: { alignItems: 'center', paddingVertical: 8 },
  signUpText: { fontSize: 14, color: COLORS.subText, fontWeight: '600' },
});

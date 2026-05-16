import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { FONTS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Background image - reusing the same image from Onboarding 1
const BG_IMAGE = require('../../assets/onboarding1_bg.jpg');

export default function Onboarding2Screen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background image area with rounded corners */}
      <View style={styles.imageWrapper}>
        <ImageBackground
          source={BG_IMAGE}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Top Text Overlay */}
          <View style={styles.textOverlay}>
            <Text style={styles.headingText}>Study Smarter,</Text>
            <Text style={styles.headingText}>
              <Text style={styles.textWhite}>Recall </Text>
              <Text style={styles.textGold}>Faster!</Text>
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('SignIn')}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1028',
  },
  imageWrapper: {
    flex: 1,
    marginTop: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    marginTop: height * 0.12, // Position text near the top
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headingText: {
    fontSize: 32,
    fontFamily: FONTS.extraBold,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 4,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textGold: {
    color: '#EAA636',
  },
  bottomSection: {
    paddingBottom: 40,
    paddingTop: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#1A1028',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: '#EAA636',
    width: 24,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  continueText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: '#1A1028',
    letterSpacing: -0.3,
  },
});

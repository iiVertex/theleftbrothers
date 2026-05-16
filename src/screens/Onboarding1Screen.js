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
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Background image
const BG_IMAGE = require('../../assets/onboarding1_bg.jpg');

export default function Onboarding1Screen({ navigation }) {
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
          {/* App Name Overlay - centered on the image */}
          <View style={styles.titleOverlay}>
            <Text style={styles.titleText}>
              <Text style={styles.titleWhite}>Rot</Text>
              <Text style={styles.titleGold}>Smart</Text>
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('Onboarding2')}
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
  titleOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleWhite: {
    color: '#FFFFFF',
  },
  titleGold: {
    color: '#EAA636',
  },
  bottomSection: {
    paddingBottom: 40,
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: '#1A1028',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dotActive: {
    backgroundColor: '#EAA636',
  },
  continueButton: {
    width: width - 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1028',
    letterSpacing: 0.3,
  },
});

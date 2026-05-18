import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Image,
} from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

const LOGO = require('../../assets/onboarding/logo.png');

export default function AuthChoiceScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Brand */}
      <View style={styles.brandBlock}>
        <View style={styles.logoBadge}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.brandText}>RotSmart</Text>
        <Text style={styles.tagline}>Learn smarter. Remember longer.</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('SignIn')}
          activeOpacity={0.85}
        >
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate('SignUp')}
          activeOpacity={0.85}
        >
          <Text style={styles.signupText}>Sign Up</Text>
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
    paddingBottom: 48,
  },

  brandBlock: { alignItems: 'center', marginTop: 'auto' },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logo: { width: 50, height: 50 },
  brandText: {
    fontFamily: FONTS.serifBold,
    fontSize: 32,
    color: COLORS.text1,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.subText,
    fontWeight: '500',
    marginTop: 6,
  },

  actions: { gap: 12, marginTop: 'auto' },
  loginButton: {
    width: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bg1,
    letterSpacing: 0.2,
  },
  signupButton: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signupText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text1,
    letterSpacing: 0.2,
  },
});

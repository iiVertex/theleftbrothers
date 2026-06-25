import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../constants/theme';

export default function SuccessScreen({ navigation, route }) {
  const { user } = useAuth();
  const username = route.params?.username || user?.user_metadata?.username || '';
  const firstName = username.trim().split(' ')[0] || 'there';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.spacer} />

      {/* Illustration — cropped from the onboarding reference (onb/p9.png). */}
      <Image
        source={require('../../assets/onboarding/success-trophy.png')}
        style={styles.illustration}
        resizeMode="contain"
      />

      <Text style={styles.title}>All set, {firstName}! 🎉</Text>
      <Text style={styles.body}>
        You're ready to learn smarter and remember better.
      </Text>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Home', { screen: 'HomeTab', params: { startTour: true } })}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Enter RotSmart</Text>
        <Ionicons name="arrow-forward" size={20} color={COLORS.bg1} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg1,
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 48,
  },
  spacer: { flex: 1 },

  illustration: {
    width: '100%',
    height: 300,
    alignSelf: 'center',
    marginBottom: 28,
  },

  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 30,
    color: COLORS.text1,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.subText,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  button: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bg1,
    letterSpacing: 0.2,
  },
});

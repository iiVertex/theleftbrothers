import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../constants/theme';

// Small decorative confetti specks scattered around the trophy.
const CONFETTI = [
  { top: 12, left: 32, color: '#4A90D9' },
  { top: 4, left: 130, color: '#E8B84B' },
  { top: 28, right: 40, color: '#D98BA5' },
  { top: 70, left: 14, color: '#E8B84B' },
  { top: 96, right: 18, color: '#4A90D9' },
  { top: 140, left: 40, color: '#D98BA5' },
];

export default function SuccessScreen({ navigation, route }) {
  const { user } = useAuth();
  const username = route.params?.username || user?.user_metadata?.username || '';
  const firstName = username.trim().split(' ')[0] || 'there';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.spacer} />

      {/* Illustration */}
      <View style={styles.illustration}>
        {CONFETTI.map((c, i) => (
          <View
            key={i}
            style={[
              styles.confetti,
              { backgroundColor: c.color, top: c.top, left: c.left, right: c.right },
            ]}
          />
        ))}
        <View style={styles.trophyCircle}>
          <Ionicons name="trophy" size={88} color="#E0A93D" />
        </View>
      </View>

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
    width: 220,
    height: 220,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  confetti: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 2,
  },
  trophyCircle: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: COLORS.bg3,
    alignItems: 'center',
    justifyContent: 'center',
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

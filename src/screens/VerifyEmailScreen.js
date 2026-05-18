import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../constants/theme';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 45;

export default function VerifyEmailScreen({ navigation, route }) {
  const { email, username } = route.params || {};
  const { verifyOtp, resendSignupOtp } = useAuth();

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRef = useRef(null);

  // Resend countdown.
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const handleVerify = useCallback(async (value) => {
    setVerifying(true);
    const { error } = await verifyOtp(email, value);
    setVerifying(false);
    if (error) {
      Alert.alert('Verification failed', error.message || 'That code is invalid or expired.');
      setCode('');
      inputRef.current?.focus();
    } else {
      navigation.replace('Success', { username });
    }
  }, [email, username, verifyOtp, navigation]);

  const onChangeCode = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    if (digits.length === CODE_LENGTH && !verifying) {
      handleVerify(digits);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    const { error } = await resendSignupOtp(email);
    if (error) {
      Alert.alert('Could not resend', error.message);
    } else {
      setSecondsLeft(RESEND_SECONDS);
      Alert.alert('Code sent', `A new code is on its way to ${email}.`);
    }
  };

  const mmss = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={10}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text1} />
      </TouchableOpacity>

      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>
        We've sent a 6-digit code to{'\n'}
        <Text style={styles.email}>{email}</Text>
      </Text>

      {/* OTP boxes with an invisible input on top */}
      <View style={styles.otpWrap}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.otpRow}
          onPress={() => inputRef.current?.focus()}
        >
          {Array.from({ length: CODE_LENGTH }).map((_, i) => {
            const filled = i < code.length;
            const active = i === code.length;
            return (
              <View key={i} style={[styles.otpBox, (filled || active) && styles.otpBoxActive]}>
                <Text style={styles.otpDigit}>{code[i] || ''}</Text>
              </View>
            );
          })}
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={onChangeCode}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          autoFocus
          editable={!verifying}
          caretHidden
        />
      </View>

      <TouchableOpacity onPress={handleResend} disabled={secondsLeft > 0} hitSlop={8}>
        <Text style={styles.resendText}>
          {secondsLeft > 0 ? `Resend code in ${mmss}` : 'Resend code'}
        </Text>
      </TouchableOpacity>

      {verifying && (
        <View style={styles.verifyingRow}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={styles.verifyingText}>Verifying...</Text>
        </View>
      )}

      <View style={styles.spacer} />

      {/* Illustration */}
      <View style={styles.illustration}>
        <View style={styles.envelopeCircle}>
          <Ionicons name="mail" size={68} color={COLORS.accentWarm} />
        </View>
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={22} color={COLORS.bg1} />
        </View>
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
  backButton: { marginBottom: 24 },

  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 32,
    color: COLORS.text1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.subText,
    fontWeight: '500',
    marginBottom: 32,
  },
  email: { color: COLORS.text1, fontWeight: '700' },

  otpWrap: { position: 'relative' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: { borderColor: COLORS.accent },
  otpDigit: { fontSize: 22, fontWeight: '700', color: COLORS.text1 },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },

  resendText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.subText,
    textAlign: 'center',
    marginTop: 20,
  },
  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  verifyingText: { fontSize: 13, color: COLORS.subText, fontWeight: '500' },

  spacer: { flex: 1 },

  illustration: { alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  envelopeCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.bg3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: '30%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.bg1,
  },
});

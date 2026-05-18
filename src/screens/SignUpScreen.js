import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, KeyboardAvoidingView, Platform, ScrollView, Alert, Image,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../constants/theme';

const LOGO = require('../../assets/onboarding/logo.png');

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useAuth();

  const hasLength = password.length >= 8;
  const hasNumberOrSymbol = /[\d\W_]/.test(password);
  const passwordValid = hasLength && hasNumberOrSymbol;

  const handleSignUp = async () => {
    if (!fullName.trim() || !email || !password) {
      Alert.alert('Error', 'Please fill in your name, email and password');
      return;
    }
    if (!passwordValid) {
      Alert.alert('Weak password', 'Please meet all the password requirements.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, { data: { username: fullName.trim() } });
    setLoading(false);
    if (error) {
      Alert.alert('Registration Failed', error.message || 'Please check your information and try again.');
    } else {
      navigation.navigate('VerifyEmail', { email: email.trim(), username: fullName.trim() });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text1} />
          </TouchableOpacity>

          <Text style={styles.title}>Create your{'\n'}RotSmart account</Text>
          <Text style={styles.subtitle}>Start recording. Start learning.</Text>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={COLORS.subText} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={COLORS.subTextLight}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={COLORS.subText} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={COLORS.subTextLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.subText} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.subTextLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} hitSlop={8}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.subText} />
              </TouchableOpacity>
            </View>

            {/* Password rules */}
            <View style={styles.rulesBlock}>
              <Rule met={hasLength} label="At least 8 characters" />
              <Rule met={hasNumberOrSymbol} label="Include a number or symbol" />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && { opacity: 0.7 }]}
              onPress={handleSignUp}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.orText}>or continue with</Text>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
              <FontAwesome5 name="google" size={20} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
              <Ionicons name="logo-apple" size={24} color={COLORS.text1} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
              <Image source={LOGO} style={styles.socialLogo} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')} hitSlop={8}>
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Rule({ met, label }) {
  return (
    <View style={styles.ruleRow}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={18}
        color={met ? COLORS.success : COLORS.subTextLight}
      />
      <Text style={[styles.ruleText, met && styles.ruleTextMet]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 40,
  },
  backButton: { marginBottom: 24 },

  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 32,
    lineHeight: 38,
    color: COLORS.text1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.subText,
    fontWeight: '500',
    marginBottom: 28,
  },

  form: { gap: 14 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 15, color: COLORS.text1, fontWeight: '500' },
  eyeBtn: { paddingLeft: 10 },

  rulesBlock: { gap: 8, marginTop: 2 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleText: { fontSize: 13, color: COLORS.subText, fontWeight: '500' },
  ruleTextMet: { color: COLORS.text1 },

  primaryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: { color: COLORS.bg1, fontSize: 16, fontWeight: '700' },

  orText: {
    textAlign: 'center',
    color: COLORS.subText,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 16,
  },
  socialRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  socialBtn: {
    flex: 1,
    height: 56,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLogo: { width: 24, height: 24 },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 28,
  },
  footerText: { color: COLORS.subText, fontSize: 14, fontWeight: '500' },
  footerLink: { color: COLORS.text1, fontSize: 14, fontWeight: '700' },
});

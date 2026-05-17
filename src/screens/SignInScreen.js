import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions,
  StatusBar, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../constants/theme';

const { height } = Dimensions.get('window');
const BG_IMAGE = require('../../assets/signin_bg.jpg');

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      navigation.replace('Home');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ImageBackground source={BG_IMAGE} style={styles.backgroundImage} resizeMode="cover">
        {/* Overlay */}
        <View style={styles.overlay} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={26} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.switchText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>

              {/* Social Login */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn}>
                  <FontAwesome5 name="google" size={16} color={COLORS.text1} />
                  <Text style={styles.socialBtnText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialBtn, styles.socialBtnIcon]}>
                  <FontAwesome5 name="facebook-f" size={18} color={COLORS.text1} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialBtn, styles.socialBtnIcon]}>
                  <FontAwesome5 name="twitter" size={18} color={COLORS.text1} />
                </TouchableOpacity>
              </View>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or with email</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotRow}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.signInButton, loading && { opacity: 0.7 }]}
                  onPress={handleSignIn}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  <Text style={styles.signInText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,14,12,0.55)',
  },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: { padding: 4 },
  switchText: { color: COLORS.bg1, fontSize: 15, fontWeight: '700' },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    marginTop: height * 0.04,
  },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 38,
    color: COLORS.white,
    letterSpacing: 0,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '400',
    marginBottom: 32,
  },

  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg1,
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
  },
  socialBtnIcon: { flex: 0, paddingHorizontal: 18 },
  socialBtnText: { color: COLORS.text1, fontSize: 14, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  dividerText: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginHorizontal: 12, fontWeight: '500' },

  formContainer: { gap: 12, marginBottom: 40 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 15, color: COLORS.white, fontWeight: '500' },
  eyeBtn: { paddingLeft: 10 },
  forgotRow: { alignItems: 'flex-end' },
  forgotText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  signInButton: {
    backgroundColor: COLORS.bg1,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  signInText: { color: COLORS.text1, fontSize: 16, fontWeight: '700' },
});

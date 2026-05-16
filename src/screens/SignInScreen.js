import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// Background image for Sign In screen
const BG_IMAGE = require('../../assets/signin_bg.jpg');

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    // signIn will check the credentials against the Supabase database
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    
    if (error) {
      console.error("Login Error:", error);
      Alert.alert('Login Failed', error.message);
    } else {
      // If credentials match Supabase, go to Home
      navigation.replace('Home');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={BG_IMAGE}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Navigation Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
              {/* Title */}
              <Text style={styles.title}>Login</Text>

              {/* Social Login Row */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.googleButton}>
                  <FontAwesome5 name="google" size={16} color="#FFFFFF" style={styles.socialIcon} />
                  <Text style={styles.googleButtonText}>With Google</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.iconButton}>
                  <FontAwesome5 name="facebook-f" size={20} color="#000000" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.iconButton}>
                  <FontAwesome5 name="twitter" size={20} color="#000000" />
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <Text style={styles.dividerText}>Or with Email</Text>

              {/* Inputs */}
              <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Your Email"
                    placeholderTextColor="#000000"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="........."
                    placeholderTextColor="#000000"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                  />
                  <TouchableOpacity style={styles.forgotButton}>
                    <Text style={styles.forgotText}>Forgot?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={handleSignIn}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  <Text style={styles.signInText}>{loading ? 'Logging In...' : 'Login'}</Text>
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
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // Adjust for status bar
  },
  backButton: {
    padding: 4,
  },
  signUpText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    marginTop: height * 0.05,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3A226', // Yellow/Orange color from design
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  socialIcon: {
    marginRight: 8,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dividerText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 20,
  },
  formContainer: {
    gap: 16,
    marginBottom: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 56,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  forgotButton: {
    paddingLeft: 10,
  },
  forgotText: {
    color: '#888888',
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: '#6C48E2', // Indigo/Purple color from design
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

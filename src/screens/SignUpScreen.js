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

// Background image for Sign Up screen (using same as Sign In)
const BG_IMAGE = require('../../assets/signin_bg.jpg');

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please enter username, email and password to sign up');
      return;
    }
    setLoading(true);
    // Explicitly pass data directly to the options argument now
    const { error } = await signUp(email, password, { data: { username: username.trim() } });
    setLoading(false);
    
    if (error) {
      console.error("Supabase Registration Error:", error);
      Alert.alert('Registration Failed', error.message || 'Please check your information and try again.');
    } else {
      Alert.alert('Success', 'Successfully signed up!');
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
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.signUpText}>Log In</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
              {/* Title */}
              <Text style={styles.title}>Sign Up</Text>

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

              {/* Inputs */}
              <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#000000"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

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
                    placeholder="Password"
                    placeholderTextColor="#000000"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                  />
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={handleSignUp}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  <Text style={styles.signUpTextBtn}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
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
    marginBottom: 30,
    gap: 15,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  socialIcon: {
    marginRight: 8,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    marginTop: 20,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 16,
    paddingHorizontal: 20,
    height: 56,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 15,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: 'rgba(108, 92, 231, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  signUpTextBtn: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import AppNavigator from './src/navigation/AppNavigator';
import { DataProvider } from './src/context/DataContext';
import { AuthProvider } from './src/context/AuthContext';
import { APP_FONTS, applyMontserratFont } from './src/utils/fonts';

// Route every Text / TextInput through Montserrat before the tree renders.
applyMontserratFont();

SplashScreen.preventAutoHideAsync();

// Catches any render-time crash in the tree and shows it on screen, instead of
// failing silently and leaving the app frozen on the splash screen .
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[App] crashed during render:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      const err = this.state.error;
      return (
        <ScrollView
          style={{ flex: 1, backgroundColor: '#fff' }}
          contentContainerStyle={{ padding: 24, paddingTop: 80 }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            App failed to start
          </Text>
          <Text style={{ fontSize: 13, color: '#C0392B', marginBottom: 16 }}>
            {String(err?.message || err)}
          </Text>
          <Text style={{ fontSize: 11, color: '#666' }}>
            {String(err?.stack || '')}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(APP_FONTS);

  // Hide the splash shortly after mount no matter what. The app no longer
  // blocks on font loading — text simply falls back to the system font until
  // the custom fonts arrive, so a stalled download can't freeze the splash.
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsLoaded) console.log('[fonts] loaded');
    if (fontError) {
      console.warn('[fonts] failed to load, falling back to system font:', fontError);
    }
  }, [fontsLoaded, fontError]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AuthProvider>
          <DataProvider>
            <AppNavigator />
          </DataProvider>
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

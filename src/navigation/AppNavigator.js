import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Onboarding1Screen from '../screens/Onboarding1Screen';
import Onboarding2Screen from '../screens/Onboarding2Screen';
import Onboarding3Screen from '../screens/Onboarding3Screen';
import Onboarding4Screen from '../screens/Onboarding4Screen';
import Onboarding5Screen from '../screens/Onboarding5Screen';
import AuthChoiceScreen from '../screens/AuthChoiceScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import SuccessScreen from '../screens/SuccessScreen';
import MainTabNavigator from './MainTabNavigator';
import CreateVideoScreen from '../screens/CreateVideoScreen';
import FolderDetailScreen from '../screens/FolderDetailScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import { useAuth } from '../context/AuthContext';
import { getOnboardingComplete, clearOnboardingComplete } from '../utils/onboarding';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { session, loading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState(null);

  useEffect(() => {
    // TEMP (dev): reset the show-once flag so the intro replays this launch.
    // Remove this line + the import once you've seen the onboarding flow.
    clearOnboardingComplete().then(() => setOnboardingComplete(false));
  }, []);

  // Wait until both the auth session and the onboarding flag are resolved so
  // the navigator mounts with the correct initial route exactly once.
  const ready = !loading && onboardingComplete !== null;
  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: '#F5F0E8' }} />;
  }

  const initialRouteName = session
    ? 'Home'
    : onboardingComplete
      ? 'AuthChoice'
      : 'Onboarding1';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#F5F0E8' },
        }}
      >
        <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />
        <Stack.Screen name="Onboarding2" component={Onboarding2Screen} />
        <Stack.Screen name="Onboarding3" component={Onboarding3Screen} />
        <Stack.Screen name="Onboarding4" component={Onboarding4Screen} />
        <Stack.Screen name="Onboarding5" component={Onboarding5Screen} />
        <Stack.Screen name="AuthChoice" component={AuthChoiceScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        <Stack.Screen name="Success" component={SuccessScreen} />
        <Stack.Screen name="Home" component={MainTabNavigator} />
        <Stack.Screen
          name="CreateVideo"
          component={CreateVideoScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="FolderDetail" component={FolderDetailScreen} />
        <Stack.Screen
          name="ProfileEdit"
          component={ProfileEditScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import AsyncStorage from '@react-native-async-storage/async-storage';

// Whether the user has already walked through the intro slides. Once set, later
// app launches skip straight to the AuthChoice screen.
const ONBOARDING_KEY = 'rotsmart_onboarding_v1';

export async function getOnboardingComplete() {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete() {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Non-fatal: worst case the intro shows again next launch.
  }
}

export async function clearOnboardingComplete() {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch {
    // Non-fatal.
  }
}

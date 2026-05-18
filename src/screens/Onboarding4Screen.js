import React from 'react';
import OnboardingSlide from '../components/OnboardingSlide';
import { setOnboardingComplete } from '../utils/onboarding';

export default function Onboarding4Screen({ navigation }) {
  const skip = async () => {
    await setOnboardingComplete();
    navigation.replace('AuthChoice');
  };

  return (
    <OnboardingSlide
      index={3}
      title="Rot to remember"
      subtitle="Revisit and rewatch so what you learn actually sticks."
      illustration={require('../../onb/p3.png')}
      onNext={() => navigation.navigate('Onboarding5')}
      onSkip={skip}
    />
  );
}

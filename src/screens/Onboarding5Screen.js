import React from 'react';
import OnboardingSlide from '../components/OnboardingSlide';
import { setOnboardingComplete } from '../utils/onboarding';

export default function Onboarding5Screen({ navigation }) {
  const finish = async () => {
    await setOnboardingComplete();
    navigation.replace('AuthChoice');
  };

  return (
    <OnboardingSlide
      index={4}
      title={'Smarter learning.\nStronger you.'}
      subtitle="Build a daily habit that compounds into real growth."
      illustration={require('../../onb/p4.png')}
      onNext={finish}
      onSkip={finish}
    />
  );
}

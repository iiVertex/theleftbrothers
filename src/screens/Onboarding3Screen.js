import React from 'react';
import OnboardingSlide from '../components/OnboardingSlide';
import { setOnboardingComplete } from '../utils/onboarding';

export default function Onboarding3Screen({ navigation }) {
  const skip = async () => {
    await setOnboardingComplete();
    navigation.replace('AuthChoice');
  };

  return (
    <OnboardingSlide
      index={2}
      title="Organise your knowledge"
      subtitle="Sort every clip into smart libraries you find in seconds."
      illustration={require('../../onb/p2.png')}
      onNext={() => navigation.navigate('Onboarding4')}
      onSkip={skip}
    />
  );
}

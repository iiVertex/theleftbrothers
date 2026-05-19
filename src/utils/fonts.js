import React from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';

import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';

import {
  BodoniModa_400Regular,
  BodoniModa_600SemiBold,
  BodoniModa_700Bold,
  BodoniModa_900Black,
} from '@expo-google-fonts/bodoni-moda';

// Fonts to pass into expo-font's useFonts()
export const MONTSERRAT_FONTS = {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
};

// High-contrast serif (Didone) used for the user's name and hero titles.
export const BODONI_FONTS = {
  BodoniModa_400Regular,
  BodoniModa_600SemiBold,
  BodoniModa_700Bold,
  BodoniModa_900Black,
};

// Everything to load via useFonts() at app start.
export const APP_FONTS = { ...MONTSERRAT_FONTS, ...BODONI_FONTS };

// Map a numeric/string fontWeight to the matching Montserrat variant.
// Custom fonts don't respond to fontWeight reliably across platforms, so the
// weight has to be baked into the family name.
function familyForWeight(weight) {
  switch (String(weight)) {
    case '500':
      return 'Montserrat_500Medium';
    case '600':
      return 'Montserrat_600SemiBold';
    case '700':
    case 'bold':
      return 'Montserrat_700Bold';
    case '800':
    case '900':
      return 'Montserrat_800ExtraBold';
    default:
      return 'Montserrat_400Regular';
  }
}

// Patches the global Text / TextInput components so every piece of text in the
// app renders in Montserrat — no need to touch each screen's StyleSheet.
// Styles that set an explicit `fontFamily` (e.g. the Bodoni serif on hero
// titles) keep it, since `flattened.fontFamily` takes precedence below.
export function applyMontserratFont() {
  [Text, TextInput].forEach((Component) => {
    if (Component._montserratPatched) return;

    const originalRender = Component.render;
    if (typeof originalRender !== 'function') return;

    Component.render = function render(...args) {
      const element = originalRender.apply(this, args);
      // A Text/TextInput can render null/non-element — leave those untouched.
      if (!element || !React.isValidElement(element)) return element;

      const flattened = StyleSheet.flatten(element.props.style) || {};
      const fontFamily = flattened.fontFamily || familyForWeight(flattened.fontWeight);

      // Merge into a flat object rather than a style array: on react-native-web
      // the rendered element is a host <span> whose style must be a plain object
      // — passing an array makes react-dom crash setting indexed CSS properties.
      return React.cloneElement(element, {
        style: { ...flattened, fontFamily, fontWeight: 'normal' },
      });
    };

    Component._montserratPatched = true;
  });
}

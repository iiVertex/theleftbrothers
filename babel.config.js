module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Required by react-native-reanimated v4 / react-native-worklets.
    // Without it, worklets are left untransformed and the app crashes on
    // startup on native (Android/iOS) — it only "works" on web because web
    // doesn't use the native worklet runtime. Must stay last in the list.
    plugins: ['react-native-worklets/plugin'],
  };
};

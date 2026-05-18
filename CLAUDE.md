# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository..

## Commands

```bash
# Start development server (choose platform)
npx expo start
npx expo start --android
npx expo start --ios
npx expo start --web
```

No test runner or linter is configured.

## Architecture

RotSmart (package name `reelsvault`) is an **Expo/React Native** app for saving and organizing short-form videos (reels). It uses **Supabase** as the backend (auth + database + storage).

### Provider hierarchy (`App.js`)

```
GestureHandlerRootView
  └── AuthProvider       ← Supabase auth session
        └── DataProvider ← folders/videos data, synced to Supabase
              └── AppNavigator
```

### Navigation structure

`AppNavigator` (native stack) has two logical zones:

- **Unauthenticated**: `Onboarding1`–`Onboarding5` (intro slides) → `AuthChoice` → `SignIn` / `SignUp` → `VerifyEmail` → `Success`
- **Authenticated**: `Home` (wraps `MainTabNavigator`) + modal screens `CreateVideo` and `FolderDetail`

`AppNavigator` picks its initial route from the auth session and an AsyncStorage flag (`src/utils/onboarding.js`, key `rotsmart_onboarding_v1`): logged in → `Home`; onboarding already seen → `AuthChoice`; otherwise the intro slides. Intro slides P1–P4 share `src/components/OnboardingSlide.js`. Sign-up uses Supabase email OTP — `VerifyEmailScreen` calls `verifyOtp` from `AuthContext` (requires the Supabase "Confirm signup" email template to send `{{ .Token }}`).

> ⚠️ **Temporary dev code:** `AppNavigator`'s mount effect currently calls `clearOnboardingComplete()` instead of `getOnboardingComplete()`, so the intro replays on every launch. Restore the `getOnboardingComplete().then(setOnboardingComplete)` call (and drop the unused import) to re-enable show-once behavior.

### Onboarding assets

The four intro-slide illustrations are loaded with `require('../../onb/pN.png')` — i.e. **directly from the top-level `onb/` folder**, not `assets/`. This is deliberate so the images can be swapped without a copy step. `onb/` also holds the design reference (`onboarding.png`) and originals. The only onboarding image under `assets/` is `assets/onboarding/logo.png` (the RotSmart spiral), used by the Initial, AuthChoice, SignIn, and SignUp screens. Metro caches `require`'d images — restart with `npx expo start -c` if a swapped image doesn't refresh.

`MainTabNavigator` uses a custom floating pill-shaped tab bar with tabs: Home, Folders, Add (navigates to `CreateVideo` modal), Reels, Profile.

### Context layer (`src/context/`)

- **`AuthContext`** — wraps `supabase.auth`, exposes `{ session, user, loading, signIn, signUp, signOut, updateProfile, verifyOtp, resendSignupOtp }`. Subscribes to auth state changes on mount.
- **`DataContext`** — depends on `useAuth`. Fetches and caches `folders` and `videos` (stored in Supabase tables `folders` and `reels`). All mutations (add/delete/update) use **optimistic updates** with rollback on error.

### Supabase schema (inferred)

| Table | Key columns |
|-------|-------------|
| `folders` | `id`, `user_id`, `name`, `color`, `icon`, `parentId`, `created_at` |
| `reels` | `id`, `user_id`, `title`, `description`, `video_url`, `folder_id`, `created_at` |
| Storage bucket | `videos` (public) |

`folder_id` in `reels` maps to `id` in `folders`; `parentId` on folders enables nesting. `DataContext` uses `parentId === 'root'` as a sentinel for top-level items.

### Video upload flow (`CreateVideoScreen`)

1. Pick video via `expo-image-picker`
2. Read as base64 with `expo-file-system`
3. Decode to `ArrayBuffer` via `base64-arraybuffer`
4. Upload to Supabase Storage bucket `videos`
5. Get public URL → call `addVideo()` in `DataContext`

### Theme system (`src/constants/theme.js`)

All screens derive dark/light variants at render time from `settings.isDarkMode` (stored in `DataContext`). There is no theme context — each screen manually computes local color variables (`bg`, `cardBg`, `text`, `subText`, `border`) from `isDark`. Use the exported `COLORS`, `FONTS`, `SPACING`, `RADIUS`, `SHADOWS` constants rather than hardcoding values.
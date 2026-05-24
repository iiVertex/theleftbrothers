import { createTour } from '@edwardloopez/react-native-coachmark';

// First-signup walkthrough of the bottom tab bar. Each step highlights one
// nav tab (anchored in MainTabNavigator's CustomTabBar) with a short blurb.
// `showOnce` persists a seen-flag via AsyncStorage as a safety net; the tour is
// only ever started from HomeScreen when arriving fresh from signup.
export const signupTour = createTour(
  'signup-tabbar-v1',
  [
    {
      id: 'tab-HomeTab',
      title: 'Home',
      placement: 'top',
      description: 'Your dashboard — streak, daily goal, and recent saves at a glance.',
    },
    {
      id: 'tab-FoldersTab',
      title: 'Folders',
      placement: 'top',
      description: 'Organize the reels you save into folders here.',
    },
    {
      id: 'tab-ReelsTab',
      title: 'Reels',
      placement: 'top',
      description: 'Watch everything you’ve saved in a full-screen feed.',
    },
    {
      id: 'tab-ProfileTab',
      title: 'Profile',
      placement: 'top',
      description: 'Your account, settings, and activity stats live here.',
    },
  ],
  { showOnce: true, delay: 500 }
);

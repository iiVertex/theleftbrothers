import { createTour } from '@edwardloopez/react-native-coachmark';

// First-signup walkthrough of the main sections. Each "page" step navigates to
// that tab and spotlights the WHOLE screen (via the full-screen `page-screen`
// anchor in MainTabNavigator) so the user sees the real page, not just an icon.
// The Add step is the one exception — it highlights the round + button, since
// "Add" is an action (opens the CreateVideo modal), not a browsable page.
//
// Built as a factory because the page steps need `navigation` to switch tabs.
// `showOnce` persists a seen-flag via AsyncStorage; the tour is only ever started
// from HomeScreen when arriving fresh from signup.

export const SIGNUP_TOUR_KEY = 'signup-tabbar-v2';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Switch to `tab` and give the pager a moment to settle before the tooltip shows.
const goToTab = (navigation, tab) => async () => {
  navigation.navigate(tab);
  await wait(380);
};

export function buildSignupTour(navigation) {
  return createTour(
    SIGNUP_TOUR_KEY,
    [
      {
        id: 'page-screen',
        title: 'Home',
        placement: 'auto',
        shape: 'rect',
        radius: 0,
        description: 'Your dashboard — streak, daily goal, and recent saves at a glance.',
        onBeforeEnter: goToTab(navigation, 'HomeTab'),
      },
      {
        id: 'page-screen',
        title: 'Folders',
        placement: 'auto',
        shape: 'rect',
        radius: 0,
        description: 'Organize the reels you save into folders here.',
        onBeforeEnter: goToTab(navigation, 'FoldersTab'),
      },
      {
        id: 'tab-Add',
        title: 'Add a reel',
        placement: 'top',
        shape: 'circle',
        description: 'Tap the + to save a new reel — paste a link or upload a video.',
      },
      {
        id: 'page-screen',
        title: 'Reels',
        placement: 'auto',
        shape: 'rect',
        radius: 0,
        description: 'Watch everything you’ve saved in a full-screen feed.',
        onBeforeEnter: goToTab(navigation, 'ReelsTab'),
      },
      {
        id: 'page-screen',
        title: 'Profile',
        placement: 'auto',
        shape: 'rect',
        radius: 0,
        description: 'Your account, settings, and activity stats live here.',
        onBeforeEnter: goToTab(navigation, 'ProfileTab'),
        // Tour ends on the last step — return the user to Home.
        onExit: () => navigation.navigate('HomeTab'),
      },
    ],
    { showOnce: true, delay: 500 }
  );
}

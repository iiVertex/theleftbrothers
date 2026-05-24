import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CoachmarkAnchor } from '@edwardloopez/react-native-coachmark';

import HomeScreen from '../screens/HomeScreen';
import FoldersScreen from '../screens/FoldersScreen';
import ReelsScreen from '../screens/ReelsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS, SHADOWS } from '../constants/theme';

const Tab = createMaterialTopTabNavigator();

// Visual layout of the pill bar. `route` is the navigator route name for a real
// swipeable screen, or null for the center "Add" button (not a navigator route).
const TAB_ITEMS = [
  { key: 'HomeTab', route: 'HomeTab', label: 'Home' },
  { key: 'FoldersTab', route: 'FoldersTab', label: 'Folders' },
  { key: 'Add', route: null, label: 'Add' },
  { key: 'ReelsTab', route: 'ReelsTab', label: 'Reels' },
  { key: 'ProfileTab', route: 'ProfileTab', label: 'Profile' },
];

const getIconName = (routeName, isFocused) => {
  if (routeName === 'HomeTab') return isFocused ? 'home' : 'home-outline';
  if (routeName === 'FoldersTab') return isFocused ? 'folder' : 'folder-outline';
  if (routeName === 'Add') return 'add';
  if (routeName === 'ReelsTab') return isFocused ? 'play-circle' : 'play-circle-outline';
  if (routeName === 'ProfileTab') return isFocused ? 'person' : 'person-outline';
  return 'ellipse-outline';
};

const CustomTabBar = ({ state, navigation }) => {
  const activeRouteName = state.routes[state.index]?.name;

  return (
    <View style={styles.tabBarContainer}>
      {TAB_ITEMS.map((item) => {
        // Center "Add" button — opens the CreateVideo modal, not a swipe page.
        if (item.route === null) {
          return (
            <TouchableOpacity
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel="Add video"
              onPress={() => navigation.navigate('CreateVideo')}
              style={styles.addTabItem}
            >
              <View style={styles.addIconCircle}>
                <Ionicons name="add" size={24} color={COLORS.bg1} />
              </View>
            </TouchableOpacity>
          );
        }

        const isFocused = activeRouteName === item.route;
        const iconName = getIconName(item.route, isFocused);

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(item.route);
          }
        };

        return (
          <CoachmarkAnchor key={item.key} id={`tab-${item.route}`} shape="pill">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={[styles.tabItem, isFocused && styles.tabItemFocused]}
            >
              <Ionicons
                name={iconName}
                size={20}
                color={isFocused ? COLORS.accent : COLORS.subText}
              />
              {isFocused && <Text style={styles.tabLabelFocused}>{item.label}</Text>}
            </TouchableOpacity>
          </CoachmarkAnchor>
        );
      })}
    </View>
  );
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      tabBarPosition="bottom"
      screenOptions={{ swipeEnabled: true, lazy: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="FoldersTab" component={FoldersScreen} />
      <Tab.Screen name="ReelsTab" component={ReelsScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
    height: 68,
    backgroundColor: COLORS.white,
    borderRadius: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.large,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  tabItemFocused: {
    backgroundColor: COLORS.bg2,
  },
  tabLabelFocused: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
  addTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  addIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

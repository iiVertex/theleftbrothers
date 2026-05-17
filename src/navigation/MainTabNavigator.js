import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import FoldersScreen from '../screens/FoldersScreen';
import ReelsScreen from '../screens/ReelsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS, SHADOWS } from '../constants/theme';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            if (route.name === 'Add') {
              navigation.navigate('CreateVideo');
              return;
            }
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        let iconName;
        if (route.name === 'HomeTab') iconName = isFocused ? 'home' : 'home-outline';
        else if (route.name === 'FoldersTab') iconName = isFocused ? 'folder' : 'folder-outline';
        else if (route.name === 'Add') iconName = 'add';
        else if (route.name === 'ReelsTab') iconName = isFocused ? 'play-circle' : 'play-circle-outline';
        else if (route.name === 'ProfileTab') iconName = isFocused ? 'person' : 'person-outline';

        if (route.name === 'Add') {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.addTabItem}
            >
              <View style={styles.addIconCircle}>
                <Ionicons name={iconName} size={24} color={COLORS.bg1} />
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tabItem, isFocused && styles.tabItemFocused]}
          >
            <Ionicons
              name={iconName}
              size={20}
              color={isFocused ? COLORS.accent : COLORS.subText}
            />
            {isFocused && (
              <Text style={styles.tabLabelFocused}>{label}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="FoldersTab" component={FoldersScreen} options={{ tabBarLabel: 'Folders' }} />
      <Tab.Screen name="Add" component={HomeScreen} options={{ tabBarLabel: 'Add' }} />
      <Tab.Screen name="ReelsTab" component={ReelsScreen} options={{ tabBarLabel: 'Reels' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
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

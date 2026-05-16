import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/HomeScreen';
import FoldersScreen from '../screens/FoldersScreen';
import ReelsScreen from '../screens/ReelsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');
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
            // For the Add button, navigate to the CreateVideo modal
            if (route.name === 'Add') {
              navigation.navigate('CreateVideo');
              return;
            }
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Determine icon name based on route
        let iconName;
        if (route.name === 'HomeTab') iconName = isFocused ? 'home' : 'home-outline';
        else if (route.name === 'FoldersTab') iconName = isFocused ? 'folder' : 'folder-outline';
        else if (route.name === 'Add') iconName = 'add-circle';
        else if (route.name === 'ReelsTab') iconName = isFocused ? 'play-circle' : 'play-circle-outline';
        else if (route.name === 'ProfileTab') iconName = isFocused ? 'person' : 'person-outline';

        // For the special Add action
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
              style={styles.tabItem}
            >
               <Ionicons name={iconName} size={32} color="#F5A623" />
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
            <Ionicons name={iconName} size={20} color={isFocused ? COLORS.primaryDark : COLORS.gray} />
            {isFocused && (
              <Text style={[styles.tabLabelFocused, { color: COLORS.primaryDark }]}>
                {label}
              </Text>
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
      screenOptions={{
        headerShown: false,
      }}
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
    bottom: 30,
    left: 24,
    right: 24,
    height: 70,
    backgroundColor: COLORS.white, // White pill background
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    ...SHADOWS.large,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 24,
  },
  tabItemFocused: {
    backgroundColor: 'rgba(108, 92, 231, 0.12)', // Light purple highlight pill
  },
  tabLabelFocused: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
  },
});

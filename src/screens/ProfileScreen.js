import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Modal, Switch, ScrollView, Alert, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import ActivityHeatMap from '../components/ActivityHeatMap';

export default function ProfileScreen({ navigation }) {
  const { folders, videos, userStats, viewActivity, settings, setSettings } = useData();
  const { user, signOut } = useAuth();
  const avatarUrl = user?.user_metadata?.avatar_url;
  const [isSettingsVisible, setSettingsVisible] = useState(false);

  const doLogout = async () => {
    await signOut();
    // SignIn lives in the parent stack, not the tab navigator.
    const rootNav = navigation.getParent() || navigation;
    rootNav.reset({ index: 0, routes: [{ name: 'SignIn' }] });
  };

  const handleLogout = () => {
    // Alert.alert is a no-op on react-native-web, so the confirm dialog (and
    // its onPress callback) never fires there — fall back to window.confirm.
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) doLogout();
      return;
    }
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: doLogout },
      ],
    );
  };

  const toggleNotifications = () => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled });
  const toggleDarkMode = () => setSettings({ ...settings, isDarkMode: !settings.isDarkMode });

  const incrementVideoLimit = () => setSettings({ ...settings, dailyVideoLimit: settings.dailyVideoLimit + 1 });
  const decrementVideoLimit = () => setSettings({ ...settings, dailyVideoLimit: Math.max(1, settings.dailyVideoLimit - 1) });

  const incrementNightTime = () => {
    let [hours, mins] = settings.nightTimeLimit.split(':').map(Number);
    hours = (hours + 1) % 24;
    setSettings({ ...settings, nightTimeLimit: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}` });
  };

  const decrementNightTime = () => {
    let [hours, mins] = settings.nightTimeLimit.split(':').map(Number);
    hours = (hours - 1 + 24) % 24;
    setSettings({ ...settings, nightTimeLimit: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}` });
  };

  const isDark = settings.isDarkMode;
  const bg = isDark ? COLORS.darkBg : COLORS.bg1;
  const cardBg = isDark ? COLORS.darkCard : COLORS.white;
  const text = isDark ? COLORS.bg1 : COLORS.text1;
  const subText = isDark ? COLORS.darkSubText : COLORS.subText;
  const border = isDark ? COLORS.darkBorder : COLORS.border;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: border }]}>
          <Text style={[styles.headerTitle, { color: text }]}>Profile</Text>
          <TouchableOpacity
            style={[styles.settingsBtn, { backgroundColor: cardBg, borderColor: border }]}
            onPress={() => setSettingsVisible(true)}
          >
            <Ionicons name="settings-outline" size={20} color={text} />
          </TouchableOpacity>
        </View>

        {/* User Identity */}
        <View style={styles.identityContainer}>
          <View style={[styles.avatarContainer, { backgroundColor: isDark ? COLORS.darkCard : COLORS.bg3, borderColor: border }]}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={40} color={subText} />
            )}
          </View>
          <Text style={[styles.userName, { color: text }]}>
            {user?.user_metadata?.username || user?.email || 'Guest User'}
          </Text>
          <Text style={[styles.userHandle, { color: subText }]}>
            @{user?.user_metadata?.username?.toLowerCase().replace(/\s+/g, '') || 'user'}
          </Text>
          <TouchableOpacity
            style={[styles.editProfileBtn, { borderColor: border }]}
            onPress={() => (navigation.getParent() || navigation).navigate('ProfileEdit')}
          >
            <Text style={[styles.editProfileText, { color: text }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {[
            { icon: 'play-outline', label: 'Videos', value: videos.length, iconBg: isDark ? '#2A2520' : COLORS.bg3 },
            { icon: 'folder-outline', label: 'Folders', value: folders.length, iconBg: isDark ? '#2A2520' : COLORS.bg3 },
            { icon: 'trending-up', label: 'Views', value: userStats.views, iconBg: isDark ? '#2A2520' : COLORS.bg3 },
          ].map(({ icon, label, value, iconBg }) => (
            <View key={label} style={[styles.statCard, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={20} color={subText} />
              </View>
              <Text style={[styles.statNumber, { color: text }]}>{value}</Text>
              <Text style={[styles.statLabel, { color: subText }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Activity Heat Map */}
        <ActivityHeatMap
          viewActivity={viewActivity}
          isDark={isDark}
          cardBg={cardBg}
          text={text}
          subText={subText}
          border={border}
        />

        {/* About Card */}
        <View style={[styles.aboutCard, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={styles.aboutHeader}>
            <Ionicons name="information-circle-outline" size={20} color={text} />
            <Text style={[styles.aboutTitle, { color: text }]}>About</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: subText }]}>App</Text>
            <Text style={[styles.aboutValue, { color: text }]}>RotSmart</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: subText }]}>Version</Text>
            <Text style={[styles.aboutValue, { color: text }]}>1.0.0</Text>
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SETTINGS MODAL */}
      <Modal visible={isSettingsVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.settingsContent, { backgroundColor: isDark ? COLORS.darkCard : COLORS.white, borderColor: border }]}>
            <View style={styles.settingsHeader}>
              <Text style={[styles.settingsTitle, { color: text }]}>Settings</Text>
              <TouchableOpacity
                onPress={() => setSettingsVisible(false)}
                style={[styles.closeSettingsBtn, { backgroundColor: isDark ? COLORS.darkBorder : COLORS.bg2 }]}
              >
                <Ionicons name="close" size={20} color={text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Notifications Toggle */}
              <View style={[styles.settingRow, { borderBottomColor: border }]}>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: text }]}>Notifications</Text>
                  <Text style={[styles.settingDescription, { color: subText }]}>Receive daily reminders</Text>
                </View>
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: border, true: COLORS.accent }}
                  thumbColor={COLORS.white}
                />
              </View>

              {/* Dark Mode Toggle */}
              <View style={[styles.settingRow, { borderBottomColor: border }]}>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: text }]}>Dark Mode</Text>
                  <Text style={[styles.settingDescription, { color: subText }]}>Easier on the eyes</Text>
                </View>
                <Switch
                  value={settings.isDarkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: border, true: COLORS.accent }}
                  thumbColor={COLORS.white}
                />
              </View>

              {/* Night-Time Limit */}
              <View style={[styles.settingRow, { borderBottomColor: border }]}>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: text }]}>Night-time Limit</Text>
                  <Text style={[styles.settingDescription, { color: subText }]}>Warn me past this time</Text>
                </View>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    onPress={decrementNightTime}
                    style={[styles.stepperBtn, { backgroundColor: isDark ? COLORS.darkBorder : COLORS.bg2, borderColor: border }]}
                  >
                    <Ionicons name="chevron-back" size={16} color={text} />
                  </TouchableOpacity>
                  <Text style={[styles.stepperText, { color: text }]}>{settings.nightTimeLimit}</Text>
                  <TouchableOpacity
                    onPress={incrementNightTime}
                    style={[styles.stepperBtn, { backgroundColor: isDark ? COLORS.darkBorder : COLORS.bg2, borderColor: border }]}
                  >
                    <Ionicons name="chevron-forward" size={16} color={text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Daily Video Limit */}
              <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: text }]}>Daily Video Limit</Text>
                  <Text style={[styles.settingDescription, { color: subText }]}>Maximum uploads per day</Text>
                </View>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    onPress={decrementVideoLimit}
                    style={[styles.stepperBtn, { backgroundColor: isDark ? COLORS.darkBorder : COLORS.bg2, borderColor: border }]}
                  >
                    <Ionicons name="remove" size={16} color={text} />
                  </TouchableOpacity>
                  <Text style={[styles.stepperText, { color: text }]}>{settings.dailyVideoLimit}</Text>
                  <TouchableOpacity
                    onPress={incrementVideoLimit}
                    style={[styles.stepperBtn, { backgroundColor: isDark ? COLORS.darkBorder : COLORS.bg2, borderColor: border }]}
                  >
                    <Ionicons name="add" size={16} color={text} />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  headerTitle: { fontFamily: FONTS.serifBold, fontSize: 30, letterSpacing: 0 },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  identityContainer: { alignItems: 'center', paddingVertical: 28 },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  userName: { fontFamily: FONTS.serifBold, fontSize: 26, letterSpacing: 0, marginBottom: 4 },
  userHandle: { fontSize: 14, fontWeight: '500', marginBottom: 16 },
  editProfileBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
  },
  editProfileText: { fontSize: 13, fontWeight: '700' },

  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 3 },
  statLabel: { fontSize: 11, fontWeight: '700', letterSpacing: FONTS.tracking.tight, textTransform: 'uppercase' },

  // About Card
  aboutCard: {
    marginHorizontal: 24,
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.small,
  },
  aboutHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  aboutTitle: { fontSize: 13, fontWeight: '700', letterSpacing: FONTS.tracking.wide, textTransform: 'uppercase' },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  aboutLabel: { fontSize: 15, fontWeight: '500' },
  aboutValue: { fontSize: 15, fontWeight: '700' },

  // Log Out Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: 'rgba(192,57,43,0.06)',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.error },

  // Settings Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  settingsContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
    borderWidth: 1,
    borderBottomWidth: 0,
    ...SHADOWS.large,
  },
  settingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  settingsTitle: { fontSize: 20, fontWeight: '800' },
  closeSettingsBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingTextContainer: { flex: 1, paddingRight: 16 },
  settingLabel: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  settingDescription: { fontSize: 13, fontWeight: '400' },
  stepperContainer: { flexDirection: 'row', alignItems: 'center' },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperText: {
    fontSize: 15,
    fontWeight: '700',
    marginHorizontal: 10,
    minWidth: 36,
    textAlign: 'center',
  },
});

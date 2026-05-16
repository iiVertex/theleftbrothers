import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Modal, Switch, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { folders, videos, userStats, settings, setSettings } = useData();
  const { user, signOut } = useAuth();
  const [isSettingsVisible, setSettingsVisible] = useState(false);

  const toggleNotifications = () => setSettings({...settings, notificationsEnabled: !settings.notificationsEnabled});
  const toggleDarkMode = () => setSettings({...settings, isDarkMode: !settings.isDarkMode});
  
  const incrementVideoLimit = () => setSettings({...settings, dailyVideoLimit: settings.dailyVideoLimit + 1});
  const decrementVideoLimit = () => setSettings({...settings, dailyVideoLimit: Math.max(1, settings.dailyVideoLimit - 1)});

  const handleLogout = async () => {
    await signOut();
    // Use parent navigator to reset to SignIn
    const parentNav = navigation.getParent();
    parentNav?.reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
  };

  const incrementNightTime = () => {
    let [hours, mins] = settings.nightTimeLimit.split(':').map(Number);
    hours = (hours + 1) % 24;
    setSettings({...settings, nightTimeLimit: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`});
  };
  
  const decrementNightTime = () => {
    let [hours, mins] = settings.nightTimeLimit.split(':').map(Number);
    hours = (hours - 1 + 24) % 24;
    setSettings({...settings, nightTimeLimit: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`});
  };

  const isDark = settings.isDarkMode;
  const bg = isDark ? '#121212' : COLORS.white;
  const text = isDark ? COLORS.white : COLORS.dark;
  const cardBg = isDark ? '#1E1E1E' : COLORS.white;
  const border = isDark ? '#333333' : '#F0F0F0';
  const subText = isDark ? '#A0A0A0' : '#8A8D9F';
  const username = user?.user_metadata?.username?.trim() || user?.email?.split('@')[0] || 'Username';
  const handle = username.startsWith('@') ? username : `@${username}`;
  const avatarUrl = user?.user_metadata?.avatar_url || '';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <View style={styles.background}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFB74D' : '#F5A623' }]}>Profile</Text>
          <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: cardBg }]} onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={24} color={text} />
          </TouchableOpacity>
        </View>

        {/* User Identity Section */}
        <View style={styles.identityContainer}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={50} color={COLORS.primaryLight} />
            )}
          </View>
          <Text style={[styles.userName, { color: text }]}>{username}</Text>
          <Text style={[styles.userHandle, { color: subText }]}>{handle}</Text>
          <TouchableOpacity style={styles.editProfileBtn} onPress={() => navigation.navigate('ProfileEdit')}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {/* Videos Card */}
          <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: border }]}>
            <View style={[styles.iconContainer, { backgroundColor: '#FCE4EC' }]}>
              <Ionicons name="play-outline" size={24} color="#E91E63" />
            </View>
            <Text style={[styles.statNumber, { color: text }]}>{videos.length}</Text>
            <Text style={[styles.statLabel, { color: subText }]}>Videos</Text>
          </View>

          {/* Folders Card */}
          <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: border }]}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="folder-outline" size={24} color="#F5A623" />
            </View>
            <Text style={[styles.statNumber, { color: text }]}>{folders.length}</Text>
            <Text style={[styles.statLabel, { color: subText }]}>Folders</Text>
          </View>

          {/* Views Card */}
          <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: border }]}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="trending-up" size={24} color="#F5A623" />
            </View>
            <Text style={[styles.statNumber, { color: text }]}>{userStats.views}</Text>
            <Text style={[styles.statLabel, { color: subText }]}>Views</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.streakCard, { backgroundColor: cardBg, borderColor: border }]}>
            <View style={styles.streakHeader}>
              <View style={styles.streakIconWrapper}>
                <Ionicons name="flame" size={24} color="#FF6B6B" />
              </View>
              <View>
                <Text style={[styles.streakTitle, { color: text }]}>Current Streak</Text>
                <Text style={[styles.streakSubtitle, { color: subText }]}>Keep the momentum going!</Text>
              </View>
            </View>
            
            <View style={[styles.streakStats, { backgroundColor: isDark ? '#2C2C2C' : '#FAFAFA' }]}>
              <View style={styles.streakStat}>
                <Text style={styles.streakNumber}>{userStats.streakDays}</Text>
                <Text style={[styles.streakLabel, { color: subText }]}>Days</Text>
              </View>
              
              <View style={[styles.streakDivider, { backgroundColor: border }]} />
              
              <View style={styles.streakStat}>
                <Text style={styles.streakNumber}>{userStats.streakWeeks}</Text>
                <Text style={[styles.streakLabel, { color: subText }]}>Weeks</Text>
              </View>

              <View style={[styles.streakDivider, { backgroundColor: border }]} />
              
              <View style={styles.streakStat}>
                <Text style={styles.streakNumber}>{userStats.streakMonths}</Text>
                <Text style={[styles.streakLabel, { color: subText }]}>Month</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SETTINGS MODAL */}
        <Modal visible={isSettingsVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.settingsContent, { backgroundColor: cardBg }]}>
              <View style={styles.settingsHeader}>
                <Text style={[styles.settingsTitle, { color: text }]}>Settings</Text>
                <TouchableOpacity onPress={() => setSettingsVisible(false)} style={[styles.closeSettingsBtn, { backgroundColor: isDark ? '#2C2C2C' : COLORS.offWhite }]}>
                  <Ionicons name="close" size={24} color={text} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                bounces={true}
                decelerationRate="fast"
                scrollEventThrottle={16}
              >
                {/* Notifications Toggle */}
                <View style={[styles.settingRow, { borderBottomColor: border }]}>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: text }]}>Notifications</Text>
                    <Text style={[styles.settingDescription, { color: subText }]}>Receive daily reminders</Text>
                  </View>
                  <Switch 
                    value={settings.notificationsEnabled} 
                    onValueChange={toggleNotifications}
                    trackColor={{ false: '#767577', true: '#FFB74D' }}
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
                    trackColor={{ false: '#767577', true: '#FFB74D' }}
                    thumbColor={COLORS.white}
                  />
                </View>

                {/* Night-Time Limit */}
                <View style={[styles.settingRow, { borderBottomColor: border }]}>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: text }]}>Night-time Limit</Text>
                    <Text style={[styles.settingDescription, { color: subText }]}>Warn me when editing past this time</Text>
                  </View>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity onPress={decrementNightTime} style={[styles.stepperBtn, { backgroundColor: isDark ? '#2C2C2C' : COLORS.offWhite }]}>
                      <Ionicons name="chevron-back" size={20} color={text} />
                    </TouchableOpacity>
                    <Text style={[styles.stepperText, { color: text }]}>{settings.nightTimeLimit}</Text>
                    <TouchableOpacity onPress={incrementNightTime} style={[styles.stepperBtn, { backgroundColor: isDark ? '#2C2C2C' : COLORS.offWhite }]}>
                      <Ionicons name="chevron-forward" size={20} color={text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Daily Video Limit */}
                <View style={[styles.settingRow, { borderBottomColor: border }]}>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: text }]}>Daily Video Limit</Text>
                    <Text style={[styles.settingDescription, { color: subText }]}>Maximum uploads per day</Text>
                  </View>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity onPress={decrementVideoLimit} style={[styles.stepperBtn, { backgroundColor: isDark ? '#2C2C2C' : COLORS.offWhite }]}>
                      <Ionicons name="remove" size={20} color={text} />
                    </TouchableOpacity>
                    <Text style={[styles.stepperText, { color: text }]}>{settings.dailyVideoLimit}</Text>
                    <TouchableOpacity onPress={incrementVideoLimit} style={[styles.stepperBtn, { backgroundColor: isDark ? '#2C2C2C' : COLORS.offWhite }]}>
                      <Ionicons name="add" size={20} color={text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity 
                  style={[styles.logoutBtn, { backgroundColor: isDark ? '#3D1F1F' : '#FFE5E5' }]}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                  <Text style={[styles.logoutText, { color: COLORS.error }]}>Sign Out</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  background: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 12 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#F5A623' }, // Orange
  settingsBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.offWhite, justifyContent: 'center', alignItems: 'center' },
  identityContainer: { alignItems: 'center', marginBottom: 28 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(108, 92, 231, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 3, borderColor: COLORS.white, ...SHADOWS.small, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 50, resizeMode: 'cover' },
  userName: { fontSize: 24, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  userHandle: { fontSize: 15, color: COLORS.gray, marginBottom: 16 },
  editProfileBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.primary },
  editProfileText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24,
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8A8D9F', // matching gray from design
    fontWeight: '600',
  },
  content: { 
    flex: 1,
  },
  streakCard: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 20,
    padding: 20,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF0F0', // Soft red/pink
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 14,
    color: '#8A8D9F',
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    paddingVertical: 16,
  },
  streakStat: {
    flex: 1,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B6B', // Fire color
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    color: '#8A8D9F',
    fontWeight: '600',
  },
  streakDivider: {
    width: 1.5,
    height: 40,
    backgroundColor: '#F0F0F0',
  },
  
  // Settings Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  settingsContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, maxHeight: '80%', ...SHADOWS.large },
  settingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  settingsTitle: { fontSize: 24, fontWeight: '800', color: COLORS.dark },
  closeSettingsBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.offWhite, justifyContent: 'center', alignItems: 'center' },
  
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  settingTextContainer: { flex: 1, paddingRight: 16 },
  settingLabel: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 4 },
  settingDescription: { fontSize: 13, color: '#8A8D9F' },
  
  stepperContainer: { flexDirection: 'row', alignItems: 'center' },
  stepperBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.offWhite, justifyContent: 'center', alignItems: 'center' },
  stepperText: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginHorizontal: 12, minWidth: 40, textAlign: 'center' },
  
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 10,
  },
  logoutText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: COLORS.error,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  StatusBar, Image, Modal, KeyboardAvoidingView, Platform,
  TextInput, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { useCoachmark } from '@edwardloopez/react-native-coachmark';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { signupTour } from '../tours/signupTour';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'GOOD MORNING';
  if (hour >= 12 && hour < 17) return 'GOOD AFTERNOON';
  if (hour >= 17 && hour < 21) return 'GOOD EVENING';
  return 'GOOD NIGHT';
}

function FolderCard({ item, onPress, itemCount, isDark, cardBg, text, subText, border }) {
  return (
    <TouchableOpacity
      style={[styles.folderCard, { backgroundColor: cardBg, borderColor: border }]}
      activeOpacity={0.75}
      onPress={onPress}
    >
      <View style={[styles.folderIconWrapper, { backgroundColor: item.color + '18' }]}>
        <Ionicons name={item.icon || 'folder'} size={28} color={item.color} />
      </View>
      <Text style={[styles.folderName, { color: text }]} numberOfLines={1}>{item.name}</Text>
      <Text style={[styles.folderCount, { color: subText }]}>{itemCount} items</Text>
    </TouchableOpacity>
  );
}

function RecentVideoCard({ item, folderName, onOptionsPress, cardBg, text, subText, border }) {
  return (
    <TouchableOpacity
      style={[styles.videoCard, { backgroundColor: cardBg, borderColor: border }]}
      activeOpacity={0.75}
    >
      <View style={[styles.videoThumbBg, { backgroundColor: COLORS.bg3 }]}>
        <Ionicons name="play" size={20} color={COLORS.subText} />
      </View>
      <View style={styles.videoInfo}>
        <Text style={[styles.videoTitle, { color: text }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.videoMetaRow}>
          <Ionicons name="folder-outline" size={13} color={subText} style={{ marginRight: 4 }} />
          <Text style={[styles.videoMeta, { color: subText }]}>{folderName || 'Root'}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onOptionsPress(item)}
        style={styles.videoOptionsBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={subText} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation, route }) {
  const { folders, videos, getFolderItemCount, deleteFolder, updateFolder, deleteVideo, settings, userStats } = useData();
  const { user } = useAuth();
  const { start } = useCoachmark();
  const isDark = settings?.isDarkMode;

  // Run the bottom-tab-bar coachmark tour once, only when arriving fresh from
  // signup (SuccessScreen passes `startTour`). Returning sign-ins never set it.
  useEffect(() => {
    if (route?.params?.startTour) start(signupTour);
  }, []);

  const userName = user?.user_metadata?.username
    || user?.email?.split('@')[0]
    || 'User';
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);
  const dailyGoal = settings?.dailyVideoLimit || 5;
  const progressRatio = Math.min(videos.length / dailyGoal, 1);

  const bg = isDark ? COLORS.darkBg : COLORS.bg1;
  const cardBg = isDark ? COLORS.darkCard : COLORS.white;
  const text = isDark ? COLORS.bg1 : COLORS.text1;
  const subText = isDark ? COLORS.darkSubText : COLORS.subText;
  const border = isDark ? COLORS.darkBorder : COLORS.border;

  const [isModalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#5C4A3A');
  const [editingFolder, setEditingFolder] = useState(null);
  const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedItemForOptions, setSelectedItemForOptions] = useState(null);

  const folderColors = ['#5C4A3A', '#8B6914', '#2C4A3E', '#3A4A5C', '#6B3A3A', '#4A3A5C'];

  const recentFolders = folders.slice(0, 5);
  const recentVideos = videos.slice(0, 5);

  const getFolderName = (parentId) => {
    if (parentId === 'root') return 'Root';
    const folder = folders.find(f => f.id === parentId);
    return folder ? folder.name : 'Unknown';
  };

  const handleOptionsPressFolder = (folder) => {
    setSelectedItemForOptions({ type: 'folder', item: folder });
    setOptionsModalVisible(true);
  };

  const handleOptionsPressVideo = (video) => {
    setSelectedItemForOptions({ type: 'video', item: video });
    setOptionsModalVisible(true);
  };

  const openEditModal = (folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setSelectedColor(folder.color);
    setModalVisible(true);
  };

  const handleSaveFolder = () => {
    if (newFolderName.trim() && editingFolder) {
      updateFolder(editingFolder.id, newFolderName.trim(), selectedColor);
      setNewFolderName('');
      setEditingFolder(null);
      setModalVisible(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* HEADER CARD */}
        <View style={styles.headerCard}>
          {/* Geometric background shapes */}
          <View style={styles.geoShape1} />
          <View style={styles.geoShape2} />
          <View style={styles.geoShape3} />

          {/* Top row: greeting + streak */}
          <View style={styles.headerTopRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerGreeting}>{getGreeting()}</Text>
              <Text style={styles.headerName}>{displayName}</Text>
              <Text style={styles.headerMeta}>{videos.length} videos · {folders.length} folders</Text>
            </View>
            <View style={styles.streakWidget}>
              <Ionicons name="flame" size={22} color="#D4924A" />
              <Text style={styles.streakNumber}>{userStats?.streakDays || 0}</Text>
              <Text style={styles.streakLabel}>STREAK</Text>
            </View>
          </View>

          {/* Daily goal row */}
          <View style={styles.goalRow}>
            <View style={styles.goalLeft}>
              <Ionicons name="radio-button-on-outline" size={16} color="rgba(255,255,255,0.45)" />
              <Text style={styles.goalText}>Daily goal</Text>
            </View>
            <Text style={styles.goalCount}>{Math.min(videos.length, dailyGoal)}/{dailyGoal} videos</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[styles.quickActionBtn, styles.quickActionPrimary]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CreateVideo')}
          >
            <Ionicons name="cloud-upload-outline" size={22} color={COLORS.bg1} />
            <Text style={styles.quickActionPrimaryText}>Upload Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, styles.quickActionSecondary, { backgroundColor: cardBg, borderColor: border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CreateVideo')}
          >
            <Ionicons name="videocam-outline" size={22} color={text} />
            <Text style={[styles.quickActionSecondaryText, { color: text }]}>Record</Text>
          </TouchableOpacity>
        </View>

        {/* FOLDERS SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: text }]}>My Folders</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: subText }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentFolders.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: border }]}>
              <Ionicons name="folder-open-outline" size={32} color={subText} />
              <Text style={[styles.emptyText, { color: subText }]}>No folders yet</Text>
            </View>
          ) : (
            <FlatList
              data={recentFolders}
              renderItem={({ item }) => (
                <FolderCard
                  item={item}
                  itemCount={getFolderItemCount(item.id)}
                  onPress={() => navigation.navigate('FolderDetail', { folderId: item.id, folderName: item.name })}
                  onOptionsPress={() => handleOptionsPressFolder(item)}
                  isDark={isDark} cardBg={cardBg} text={text} subText={subText} border={border}
                />
              )}
              keyExtractor={i => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.foldersListContent}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            />
          )}
        </View>

        {/* RECENT VIDEOS SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: text }]}>Recent Uploads</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: subText }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentVideos.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: border }]}>
              <Ionicons name="videocam-outline" size={32} color={subText} />
              <Text style={[styles.emptyText, { color: subText }]}>No videos yet</Text>
            </View>
          ) : (
            <View style={styles.videosListContent}>
              {recentVideos.map(v => (
                <RecentVideoCard
                  key={v.id}
                  item={v}
                  folderName={getFolderName(v.folder_id)}
                  onOptionsPress={() => handleOptionsPressVideo(v)}
                  cardBg={cardBg} text={text} subText={subText} border={border}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* EDIT FOLDER MODAL */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? COLORS.darkCard : COLORS.white, borderColor: border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: text }]}>Edit Folder</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.closeModalBtn, { backgroundColor: isDark ? COLORS.darkBorder : COLORS.bg2 }]}
              >
                <Ionicons name="close" size={20} color={text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: subText }]}>Folder Name</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: isDark ? COLORS.darkBorder : COLORS.bg1, color: text, borderColor: border }]}
              placeholder="e.g. Vacation 2024"
              placeholderTextColor={subText}
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />

            <Text style={[styles.inputLabel, { color: subText }]}>Folder Color</Text>
            <View style={styles.colorPickerContainer}>
              {folderColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorCircle, { backgroundColor: color }, selectedColor === color && styles.colorCircleSelected]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.createBtn} onPress={handleSaveFolder}>
              <Text style={styles.createBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* OPTIONS MODAL */}
      <Modal visible={isOptionsModalVisible} animationType="fade" transparent={true}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOptionsModalVisible(false)}>
          <View style={[styles.actionSheetContent, { backgroundColor: isDark ? COLORS.darkCard : COLORS.white, borderColor: border }]}>
            <View style={styles.actionSheetHeader}>
              <View style={[styles.sheetHandle, { backgroundColor: border }]} />
              <Text style={[styles.actionSheetTitle, { color: text }]}>
                {selectedItemForOptions?.item?.name || selectedItemForOptions?.item?.title}
              </Text>
            </View>

            {selectedItemForOptions?.type === 'folder' && (
              <TouchableOpacity
                style={[styles.actionBtn, { borderBottomColor: border }]}
                onPress={() => {
                  setOptionsModalVisible(false);
                  setTimeout(() => openEditModal(selectedItemForOptions.item), 300);
                }}
              >
                <Ionicons name="pencil-outline" size={18} color={text} style={{ marginRight: 12 }} />
                <Text style={[styles.actionText, { color: text }]}>Rename Folder</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, { borderBottomColor: border }]}
              onPress={() => {
                const itemType = selectedItemForOptions?.type;
                const itemId = selectedItemForOptions?.item?.id;
                setOptionsModalVisible(false);
                setTimeout(() => {
                  Alert.alert(
                    `Delete ${itemType === 'folder' ? 'Folder' : 'Video'}`,
                    `Are you sure? This cannot be undone.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          if (itemType === 'folder') deleteFolder(itemId);
                          if (itemType === 'video') deleteVideo(itemId);
                        },
                      },
                    ]
                  );
                }, 300);
              }}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} style={{ marginRight: 12 }} />
              <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: isDark ? COLORS.darkBorder : COLORS.bg2 }]}
              onPress={() => setOptionsModalVisible(false)}
            >
              <Text style={[styles.cancelText, { color: text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainScroll: { flex: 1 },

  // HEADER CARD
  headerCard: {
    marginHorizontal: 16,
    marginTop: 56,
    marginBottom: 20,
    backgroundColor: '#111111',
    borderRadius: 24,
    padding: 22,
    paddingBottom: 20,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  // Geometric background shapes
  geoShape1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    top: -40,
    right: 60,
    transform: [{ rotate: '20deg' }],
  },
  geoShape2: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    top: 10,
    right: 20,
    transform: [{ rotate: '40deg' }],
  },
  geoShape3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    bottom: 20,
    right: 90,
    transform: [{ rotate: '15deg' }],
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  headerGreeting: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    marginBottom: 6,
  },
  headerName: {
    fontFamily: FONTS.serifBlack,
    fontSize: 40,
    color: '#FFFFFF',
    letterSpacing: 0,
    marginBottom: 6,
    lineHeight: 44,
  },
  headerMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  // Streak widget
  streakWidget: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    width: 76,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 2,
  },
  streakNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
    lineHeight: 30,
  },
  streakLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
  },
  // Daily goal
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goalText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
  goalCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
  },
  // Progress bar
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  // QUICK ACTIONS
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
    marginBottom: 16,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    gap: 8,
  },
  quickActionPrimary: {
    backgroundColor: COLORS.accent,
  },
  quickActionPrimaryText: {
    color: COLORS.bg1,
    fontSize: 15,
    fontWeight: '700',
  },
  quickActionSecondary: {
    borderWidth: 1,
  },
  quickActionSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // SECTIONS
  sectionContainer: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: FONTS.tracking.wide,
    textTransform: 'uppercase',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // FOLDERS
  foldersListContent: { paddingHorizontal: 24, paddingBottom: 6 },
  folderCard: {
    width: 140,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    ...SHADOWS.small,
  },
  folderIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  folderName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  folderCount: { fontSize: 12, fontWeight: '500' },

  // VIDEOS
  videosListContent: { paddingHorizontal: 24 },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    ...SHADOWS.small,
  },
  videoThumbBg: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  videoInfo: { flex: 1, justifyContent: 'center' },
  videoTitle: { fontSize: 15, fontWeight: '700', marginBottom: 5, letterSpacing: -0.2 },
  videoMetaRow: { flexDirection: 'row', alignItems: 'center' },
  videoMeta: { fontSize: 12, fontWeight: '500' },
  videoOptionsBtn: { padding: 8 },

  // EMPTY STATE
  emptyCard: {
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: { fontSize: 14, fontWeight: '500' },

  // MODALS
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderBottomWidth: 0,
    ...SHADOWS.large,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  closeModalBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.2 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    marginBottom: 24,
  },
  colorPickerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  colorCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  colorCircleSelected: { borderWidth: 2.5, borderColor: 'rgba(0,0,0,0.25)' },
  createBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtnText: { color: COLORS.bg1, fontSize: 15, fontWeight: '700' },

  // ACTION SHEET
  actionSheetContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderBottomWidth: 0,
    ...SHADOWS.large,
  },
  actionSheetHeader: { alignItems: 'center', marginBottom: 16 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, marginBottom: 14 },
  actionSheetTitle: { fontSize: 16, fontWeight: '700' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  actionText: { fontSize: 15, fontWeight: '600' },
  cancelBtn: { marginTop: 12, paddingVertical: 14, alignItems: 'center', borderRadius: 14 },
  cancelText: { fontSize: 15, fontWeight: '700' },
});

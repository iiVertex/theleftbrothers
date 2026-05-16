import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, StatusBar, Image, Modal, KeyboardAvoidingView, Platform, TextInput, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

function FolderCard({ item, onPress, onOptionsPress, itemCount, isDark, cardBg, text, subText, border }) {
  // Use a soft background based on the folder's assigned color
  const softBg = item.color + '15'; // very transparent
  
  return (
    <TouchableOpacity style={[styles.folderCard, { backgroundColor: cardBg, borderWidth: isDark ? 1 : 0, borderColor: border }]} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.folderCardTop}>
        <View style={[styles.folderIconWrapper, { backgroundColor: softBg }]}>
          <Ionicons name={item.icon || 'folder'} size={32} color={item.color} />
        </View>
      </View>
      <View style={styles.folderCardBottom}>
        <Text style={[styles.folderName, { color: text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.folderCount, { color: subText }]}>{itemCount} items</Text>
      </View>
    </TouchableOpacity>
  );
}

function RecentVideoCard({ item, folderName, onOptionsPress, isDark, cardBg, text, subText, border }) {
  return (
    <TouchableOpacity style={[styles.videoCard, { backgroundColor: cardBg, borderWidth: isDark ? 1 : 0, borderColor: border }]} activeOpacity={0.8}>
      <View style={styles.videoThumbWrapper}>
        <View style={[styles.videoThumbBg, { backgroundColor: '#FF6B6B' + '20' }]}>
          <Ionicons name="play" size={24} color="#FF6B6B" />
        </View>
      </View>
      <View style={styles.videoInfo}>
        <Text style={[styles.videoTitle, { color: text }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.videoMetaRow}>
          <Ionicons name="folder-outline" size={14} color={subText} style={{marginRight: 4}} />
          <Text style={[styles.videoMeta, { color: subText }]}>{folderName || 'Root'}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => onOptionsPress(item)} style={styles.videoOptionsBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Ionicons name="ellipsis-vertical" size={20} color={subText} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { folders, videos, getFolderItemCount, deleteFolder, updateFolder, deleteVideo, settings, userStats } = useData();
  const { user } = useAuth();
  const isDark = settings?.isDarkMode;
  
  const bg = isDark ? '#0F0F1E' : '#F5F7FA'; // Softer, deeper backgrounds
  const cardBg = isDark ? '#1C1C2E' : COLORS.white;
  const text = isDark ? COLORS.white : '#2D3250'; // Navy Dark Blue from reference
  const subText = isDark ? '#8F95B2' : '#6B7280';
  const border = isDark ? '#2C2C3E' : '#EAECEF';
  const username = user?.user_metadata?.username?.trim() || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url || '';

  // State setup
  const [isModalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6C5CE7');
  const [editingFolder, setEditingFolder] = useState(null);

  const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedItemForOptions, setSelectedItemForOptions] = useState(null);

  const folderColors = ['#6C5CE7', '#F5A623', '#E91E63', '#00B8D4', '#4CAF50', '#FF9800'];

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
        bounces={true}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* HERO HEADER */}
        <View style={styles.heroSection}>
          <LinearGradient 
            colors={isDark ? ['#1A1A2E', '#16213E'] : ['#6C5CE7', '#A29BFE']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={styles.heroGradient}
          >
            {/* Abstract decorative elements */}
            <View style={[styles.abstractShape, styles.shape1]} />
            <View style={[styles.abstractShape, styles.shape2]} />
            
            <View style={styles.heroHeaderTop}>
              <View style={styles.heroGreetingRow}>
                <View style={styles.avatarWrapper}>
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={28} color={COLORS.white} />
                  )}
                </View>
                <View style={styles.greetingTextWrap}>
                  <Text style={styles.heroGreeting}>Hi {username}!</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.notificationBtn}>
                <Ionicons name="notifications" size={22} color={COLORS.white} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>
            
            {/* Removed Streak Widget */}
          </LinearGradient>
        </View>

        {/* FLOATING QUICK ACTIONS */}
        <View style={styles.floatingActionsContainer}>
          <View style={[styles.floatingCard, { backgroundColor: cardBg, borderColor: border, borderWidth: isDark ? 1 : 0 }]}>
            <TouchableOpacity 
              style={styles.actionBlock} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CreateVideo')}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#E91E63' + '15' }]}>
                <Ionicons name="videocam" size={28} color="#E91E63" />
              </View>
              <Text style={[styles.actionLabel, { color: text }]}>Record</Text>
            </TouchableOpacity>

            <View style={[styles.actionDivider, { backgroundColor: border }]} />

            <TouchableOpacity 
              style={styles.actionBlock} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CreateVideo')}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#F5A623' + '15' }]}>
                <Ionicons name="cloud-upload" size={28} color="#F5A623" />
              </View>
              <Text style={[styles.actionLabel, { color: text }]}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FOLDERS SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: text }]}>My Folders</Text>
            <TouchableOpacity><Text style={[styles.seeAllText, { color: '#6C5CE7' }]}>See All</Text></TouchableOpacity>
          </View>
          
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
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />} 
          />
        </View>

        {/* RECENT VIDEOS SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: text }]}>Recent Uploads</Text>
            <TouchableOpacity><Text style={[styles.seeAllText, { color: '#6C5CE7' }]}>See All</Text></TouchableOpacity>
          </View>
          
          <View style={styles.videosListContent}>
            {recentVideos.map(v => (
              <RecentVideoCard
                key={v.id}
                item={v}
                folderName={getFolderName(v.folder_id)}
                onOptionsPress={() => handleOptionsPressVideo(v)}
                isDark={isDark} cardBg={cardBg} text={text} subText={subText} border={border}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* EDIT FOLDER MODAL */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: text }]}>Edit Folder</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.closeModalBtn, { backgroundColor: isDark ? '#2C2C2C' : COLORS.offWhite }]}>
                <Ionicons name="close" size={24} color={text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: subText }]}>Folder Name</Text>
            <TextInput 
              style={[styles.modalInput, { backgroundColor: isDark ? '#2C2C2C' : COLORS.offWhite, color: text }]}
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
                  {selectedColor === color && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
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
          <View style={[styles.actionSheetContent, { backgroundColor: cardBg }]}>
            <View style={styles.actionSheetHeader}>
              <View style={styles.sheetHandle} />
              <Text style={[styles.actionSheetTitle, { color: text }]}>{selectedItemForOptions?.item?.name || selectedItemForOptions?.item?.title}</Text>
            </View>
            
            {selectedItemForOptions?.type === 'folder' && (
              <TouchableOpacity style={[styles.actionBtn, { borderBottomColor: border }]} onPress={() => { 
                setOptionsModalVisible(false);
                setTimeout(() => openEditModal(selectedItemForOptions.item), 300);
              }}>
                <Ionicons name="pencil" size={20} color={text} style={{marginRight: 12}} />
                <Text style={[styles.actionText, { color: text }]}>Rename Folder</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.actionBtn, { borderBottomColor: border }]} onPress={() => { 
              const itemType = selectedItemForOptions?.type;
              const itemId = selectedItemForOptions?.item?.id;
              
              setOptionsModalVisible(false);
              
              setTimeout(() => {
                Alert.alert(
                  `Delete ${itemType === 'folder' ? 'Folder' : 'Video'}`,
                  `Are you sure you want to delete this ${itemType}? This action cannot be undone.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Delete', 
                      style: 'destructive',
                      onPress: () => {
                        if (itemType === 'folder') deleteFolder(itemId);
                        if (itemType === 'video') deleteVideo(itemId);
                      }
                    }
                  ]
                );
              }, 300);
            }}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} style={{marginRight: 12}} />
              <Text style={[styles.actionText, {color: COLORS.error}]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: isDark ? '#2C2C2C' : COLORS.offWhite }]} onPress={() => setOptionsModalVisible(false)}>
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
  
  // HERO SECTION
  heroSection: {
    height: 300,
    width: '100%',
  },
  heroGradient: {
    flex: 1,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 60,
    overflow: 'hidden',
  },
  abstractShape: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 200,
  },
  shape1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  shape2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
  },
  heroHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 10,
  },
  heroGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
    marginRight: 14,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  greetingTextWrap: {
    justifyContent: 'center',
  },
  heroDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroGreeting: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6C5CE7',
  },
  // FLOATING QUICK ACTIONS
  floatingActionsContainer: {
    marginTop: -40,
    paddingHorizontal: 24,
    zIndex: 20,
    marginBottom: 32,
  },
  floatingCard: {
    flexDirection: 'row',
    borderRadius: 24,
    paddingVertical: 20,
    ...SHADOWS.large,
    elevation: 10, // Android shadow
  },
  actionBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
  },

  // SECTIONS
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // FOLDERS
  foldersListContent: {
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  folderCard: {
    width: 150,
    borderRadius: 24,
    padding: 18,
    ...SHADOWS.small,
  },
  folderCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  folderIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsBtn: {
    padding: 4,
    marginRight: -4,
    marginTop: -4,
  },
  folderCardBottom: {},
  folderName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  folderCount: {
    fontSize: 13,
    fontWeight: '600',
  },

  // VIDEOS
  videosListContent: {
    paddingHorizontal: 24,
  },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  videoThumbWrapper: {
    marginRight: 16,
  },
  videoThumbBg: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  videoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoMeta: {
    fontSize: 13,
    fontWeight: '600',
  },
  videoOptionsBtn: {
    padding: 8,
  },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, ...SHADOWS.large },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800' },
  closeModalBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  inputLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  modalInput: { borderRadius: 16, paddingHorizontal: 16, height: 56, fontSize: 16, marginBottom: 24 },
  colorPickerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  colorCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  colorCircleSelected: { borderWidth: 3, borderColor: 'rgba(0,0,0,0.2)' },
  createBtn: { backgroundColor: '#6C5CE7', borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  createBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  
  // ACTION SHEET STYLES
  actionSheetContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, ...SHADOWS.large },
  actionSheetHeader: { alignItems: 'center', marginBottom: 16 },
  sheetHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#E0E0E0', marginBottom: 16 },
  actionSheetTitle: { fontSize: 18, fontWeight: '800' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  actionText: { fontSize: 16, fontWeight: '600' },
  cancelBtn: { marginTop: 16, paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  cancelText: { fontSize: 16, fontWeight: '800' },
});

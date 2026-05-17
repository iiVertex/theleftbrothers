import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput,
  ScrollView, Modal, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { useData } from '../context/DataContext';

export default function FoldersScreen({ navigation }) {
  const { folders, videos, getFolderItemCount, addFolder, deleteFolder, updateFolder, deleteVideo, settings } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('newest');
  const [isModalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#5C4A3A');
  const [editingFolder, setEditingFolder] = useState(null);
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedItemForOptions, setSelectedItemForOptions] = useState(null);

  const folderColors = ['#5C4A3A', '#8B6914', '#2C4A3E', '#3A4A5C', '#6B3A3A', '#4A3A5C'];

  let rootFolders = folders.filter(f => f.parentId === 'root');
  if (sortMode === 'alpha_asc') rootFolders.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortMode === 'items_desc') rootFolders.sort((a, b) => getFolderItemCount(b.id) - getFolderItemCount(a.id));
  else rootFolders.sort((a, b) => b.id.localeCompare(a.id));

  const matchingVideos = searchQuery.trim()
    ? videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const isDark = settings?.isDarkMode;
  const bg = isDark ? COLORS.darkBg : COLORS.bg1;
  const cardBg = isDark ? COLORS.darkCard : COLORS.white;
  const text = isDark ? COLORS.bg1 : COLORS.text1;
  const subText = isDark ? COLORS.darkSubText : COLORS.subText;
  const border = isDark ? COLORS.darkBorder : COLORS.border;
  const inputBg = isDark ? COLORS.darkCard : COLORS.bg2;

  const handleOptionsPress = (folder) => {
    setSelectedItemForOptions({ type: 'folder', item: folder });
    setOptionsModalVisible(true);
  };

  const handleVideoOptionsPress = (video) => {
    setSelectedItemForOptions({ type: 'video', item: video });
    setOptionsModalVisible(true);
  };

  const openEditModal = (folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setSelectedColor(folder.color);
    setModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingFolder(null);
    setNewFolderName('');
    setSelectedColor('#5C4A3A');
    setModalVisible(true);
  };

  const handleSaveFolder = () => {
    if (newFolderName.trim()) {
      if (editingFolder) {
        updateFolder(editingFolder.id, newFolderName.trim(), selectedColor);
      } else {
        addFolder(newFolderName.trim(), selectedColor, 'folder', 'root');
      }
      setNewFolderName('');
      setEditingFolder(null);
      setModalVisible(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.headerContainer, { borderBottomColor: border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: text }]}>Folders</Text>
          <Text style={[styles.headerSub, { color: subText }]}>{rootFolders.length} folders</Text>
        </View>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: COLORS.accent }]} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color={COLORS.bg1} />
        </TouchableOpacity>
      </View>

      {/* Search & Sort */}
      <View style={styles.searchRow}>
        <View style={[styles.searchContainer, { backgroundColor: inputBg, borderColor: border }]}>
          <Ionicons name="search-outline" size={18} color={subText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: text }]}
            placeholder="Search videos..."
            placeholderTextColor={subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={subText} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: inputBg, borderColor: border }]}
          onPress={() => setSortModalVisible(true)}
        >
          <Ionicons name="options-outline" size={20} color={text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {searchQuery.trim() ? (
          <View>
            <Text style={[styles.sectionTitle, { color: text }]}>Video Results</Text>
            {matchingVideos.length > 0 ? matchingVideos.map(video => (
              <TouchableOpacity
                key={video.id}
                style={[styles.videoCard, { backgroundColor: cardBg, borderColor: border }]}
                activeOpacity={0.75}
              >
                <View style={[styles.videoThumb, { backgroundColor: COLORS.bg3 }]}>
                  <Ionicons name="play" size={20} color={subText} />
                </View>
                <View style={styles.videoInfo}>
                  <Text style={[styles.videoTitle, { color: text }]}>{video.title}</Text>
                  <Text style={[styles.videoMeta, { color: subText }]}>{video.description || ''}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleVideoOptionsPress(video)}
                  style={styles.optionsBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="ellipsis-vertical" size={18} color={subText} />
                </TouchableOpacity>
              </TouchableOpacity>
            )) : (
              <Text style={[styles.emptyText, { color: subText }]}>No videos found for "{searchQuery}"</Text>
            )}
          </View>
        ) : (
          <>
            {rootFolders.length === 0 ? (
              <View style={[styles.emptyState, { borderColor: border }]}>
                <Ionicons name="folder-open-outline" size={40} color={subText} />
                <Text style={[styles.emptyStateText, { color: subText }]}>No folders yet</Text>
                <TouchableOpacity style={styles.emptyCreateBtn} onPress={openCreateModal}>
                  <Text style={styles.emptyCreateText}>Create your first folder</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {rootFolders.map((folder) => (
                  <TouchableOpacity
                    key={folder.id}
                    style={[styles.folderCard, { backgroundColor: cardBg, borderColor: border }]}
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate('FolderDetail', { folderId: folder.id, folderName: folder.name })}
                  >
                    <View style={styles.folderCardHeader}>
                      <View style={[styles.folderIcon, { backgroundColor: folder.color + '18' }]}>
                        <Ionicons name={folder.icon || 'folder'} size={22} color={folder.color} />
                      </View>
                      <TouchableOpacity
                        onPress={() => handleOptionsPress(folder)}
                        style={styles.optionsBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="ellipsis-horizontal" size={18} color={subText} />
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.folderName, { color: text }]} numberOfLines={1}>{folder.name}</Text>
                    <Text style={[styles.folderCountText, { color: subText }]}>{getFolderItemCount(folder.id)} items</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CREATE / EDIT FOLDER MODAL */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? COLORS.darkCard : COLORS.white, borderColor: border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: text }]}>
                {editingFolder ? 'Edit Folder' : 'New Folder'}
              </Text>
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
              <Text style={styles.createBtnText}>{editingFolder ? 'Save Changes' : 'Create Folder'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SORT MODAL */}
      <Modal visible={isSortModalVisible} animationType="fade" transparent={true}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModalVisible(false)}>
          <View style={[styles.actionSheetContent, { backgroundColor: isDark ? COLORS.darkCard : COLORS.white, borderColor: border }]}>
            <View style={styles.actionSheetHeader}>
              <View style={[styles.sheetHandle, { backgroundColor: border }]} />
              <Text style={[styles.actionSheetTitle, { color: text }]}>Sort Folders</Text>
            </View>
            {[
              { key: 'newest', label: 'Newest first' },
              { key: 'alpha_asc', label: 'Alphabetical (A–Z)' },
              { key: 'items_desc', label: 'Most items' },
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[styles.actionBtn, { borderBottomColor: border }]}
                onPress={() => { setSortMode(key); setSortModalVisible(false); }}
              >
                <Text style={[styles.actionText, { color: sortMode === key ? COLORS.accent : text }, sortMode === key && styles.actionTextActive]}>
                  {label}
                </Text>
                {sortMode === key && <Ionicons name="checkmark" size={18} color={COLORS.accent} style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: isDark ? COLORS.darkBorder : COLORS.bg2 }]}
              onPress={() => setSortModalVisible(false)}
            >
              <Text style={[styles.cancelText, { color: text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  headerTitle: { fontFamily: FONTS.serifBold, fontSize: 30, letterSpacing: 0, marginBottom: 2 },
  headerSub: { fontSize: 13, fontWeight: '500' },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchRow: { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 16, marginBottom: 16, gap: 10 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, height: '100%' },
  sortButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 14, letterSpacing: FONTS.tracking.wide, textTransform: 'uppercase' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  folderCard: {
    width: '47.5%',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 4,
    ...SHADOWS.small,
  },
  folderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  optionsBtn: { padding: 4, marginRight: -4, marginTop: -4 },
  folderIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  folderName: { fontSize: 15, fontWeight: '700', marginBottom: 3, letterSpacing: -0.2 },
  folderCountText: { fontSize: 12, fontWeight: '500' },

  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  videoThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  videoInfo: { flex: 1 },
  videoTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3, letterSpacing: -0.2 },
  videoMeta: { fontSize: 12, fontWeight: '500' },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 16,
    gap: 10,
  },
  emptyStateText: { fontSize: 15, fontWeight: '500' },
  emptyCreateBtn: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
  },
  emptyCreateText: { color: COLORS.bg1, fontSize: 14, fontWeight: '700' },
  emptyText: { marginTop: 16, fontSize: 15, fontWeight: '500', textAlign: 'center' },

  // Modals
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
  createBtn: { backgroundColor: COLORS.accent, borderRadius: 14, height: 52, justifyContent: 'center', alignItems: 'center' },
  createBtnText: { color: COLORS.bg1, fontSize: 15, fontWeight: '700' },

  actionSheetContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderBottomWidth: 0,
    ...SHADOWS.large,
  },
  actionSheetHeader: { alignItems: 'center', marginBottom: 12 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, marginBottom: 14 },
  actionSheetTitle: { fontSize: 16, fontWeight: '700' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
  actionText: { fontSize: 15, fontWeight: '600' },
  actionTextActive: { fontWeight: '800' },
  cancelBtn: { marginTop: 12, paddingVertical: 14, alignItems: 'center', borderRadius: 14 },
  cancelText: { fontSize: 15, fontWeight: '700' },
});

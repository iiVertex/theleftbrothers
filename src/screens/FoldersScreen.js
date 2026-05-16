import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useData } from '../context/DataContext';

export default function FoldersScreen({ navigation }) {
  const { folders, videos, getFolderItemCount, addFolder, deleteFolder, updateFolder, deleteVideo, settings } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('newest');
  const [isModalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6C5CE7');
  const [editingFolder, setEditingFolder] = useState(null);
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedItemForOptions, setSelectedItemForOptions] = useState(null); // { type: 'folder' | 'video', item: ... }

  const folderColors = ['#6C5CE7', '#F5A623', '#E91E63', '#00B8D4', '#4CAF50', '#FF9800'];

  let rootFolders = folders.filter(f => f.parentId === 'root');
  if (sortMode === 'alpha_asc') rootFolders.sort((a,b) => a.name.localeCompare(b.name));
  else if (sortMode === 'items_desc') rootFolders.sort((a,b) => getFolderItemCount(b.id) - getFolderItemCount(a.id));
  else rootFolders.sort((a,b) => b.id.localeCompare(a.id)); // Newest first based on ID timestamp

  const matchingVideos = searchQuery.trim() ? videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  const handleOptionsPress = (folder) => {
    setSelectedItemForOptions({ type: 'folder', item: folder });
    setOptionsModalVisible(true);
  };

  const handleVideoOptionsPress = (video) => {
    setSelectedItemForOptions({ type: 'video', item: video });
    setOptionsModalVisible(true);
  };

  const handleSortPress = () => {
    setSortModalVisible(true);
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
    setSelectedColor('#6C5CE7');
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

  const isDark = settings?.isDarkMode;
  const bg = isDark ? '#121212' : COLORS.white;
  const cardBg = isDark ? '#1E1E1E' : COLORS.white;
  const text = isDark ? COLORS.white : COLORS.dark;
  const subText = isDark ? '#A0A0A0' : COLORS.gray;
  const border = isDark ? '#333333' : '#F0F0F0';
  const inputBg = isDark ? '#2C2C2C' : COLORS.offWhite;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <View style={styles.background}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFB74D' : '#F5A623' }]}>Folders</Text>
            <Text style={[styles.folderCount, { color: subText }]}>{rootFolders.length} folders</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
            <Ionicons name="add" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Search & Sort Section */}
        <View style={styles.searchRow}>
          <View style={[styles.searchContainer, { backgroundColor: inputBg }]}>
            <Ionicons name="search" size={20} color={subText} style={styles.searchIcon} />
            <TextInput 
              style={[styles.searchInput, { color: text }]}
              placeholder="Search videos..."
              placeholderTextColor={subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={[styles.sortButton, { backgroundColor: inputBg }]} onPress={handleSortPress}>
            <Ionicons name="options-outline" size={24} color={text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          bounces={true}
          decelerationRate="fast"
          scrollEventThrottle={16}
        >
          {searchQuery.trim() ? (
            <View>
              <Text style={[styles.sectionTitle, { color: text }]}>Video Results</Text>
              {matchingVideos.length > 0 ? matchingVideos.map(video => (
                <TouchableOpacity key={video.id} style={[styles.videoCard, { backgroundColor: cardBg, borderColor: border, borderWidth: isDark ? 1 : 0 }]} activeOpacity={0.7}>
                  <View style={styles.videoThumb}>
                    <Ionicons name="play" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={[styles.videoTitle, { color: text }]}>{video.title}</Text>
                    <Text style={[styles.videoMeta, { color: subText }]}>{video.description || ''}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleVideoOptionsPress(video)} style={styles.optionsBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Ionicons name="ellipsis-vertical" size={20} color={subText} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )) : (
                <Text style={[styles.emptyText, { color: subText }]}>No videos found for "{searchQuery}"</Text>
              )}
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {rootFolders.map((folder) => (
                <TouchableOpacity 
                  key={folder.id} 
                  style={[styles.folderCard, { backgroundColor: cardBg, borderColor: border, borderWidth: isDark ? 1 : 0 }]} 
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('FolderDetail', { folderId: folder.id, folderName: folder.name })}
                >
                  <View style={styles.folderCardHeader}>
                    <View style={[styles.folderIcon, { backgroundColor: folder.color + '15' }]}>
                      <Ionicons name={folder.icon || 'folder'} size={24} color={folder.color} />
                    </View>
                    <TouchableOpacity onPress={() => handleOptionsPress(folder)} style={styles.optionsBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                      <Ionicons name="ellipsis-horizontal" size={20} color={subText} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.folderName, { color: text }]} numberOfLines={1}>{folder.name}</Text>
                  <Text style={[styles.folderCount, { color: subText }]}>{getFolderItemCount(folder.id)} items</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* CREATE FOLDER MODAL */}
        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: text }]}>{editingFolder ? "Edit Folder" : "New Folder"}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.closeModalBtn, { backgroundColor: inputBg }]}>
                  <Ionicons name="close" size={24} color={text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: subText }]}>Folder Name</Text>
              <TextInput 
                style={[styles.modalInput, { backgroundColor: inputBg, color: text }]}
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
                <Text style={styles.createBtnText}>{editingFolder ? "Save Changes" : "Create Folder"}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* SORT MODAL */}
        <Modal visible={isSortModalVisible} animationType="fade" transparent={true}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModalVisible(false)}>
            <View style={[styles.actionSheetContent, { backgroundColor: cardBg }]}>
              <View style={styles.actionSheetHeader}>
                <Text style={[styles.actionSheetTitle, { color: text }]}>Sort Folders</Text>
              </View>
              <TouchableOpacity style={[styles.actionBtn, { borderBottomColor: border }]} onPress={() => { setSortMode('newest'); setSortModalVisible(false); }}>
                <Text style={[styles.actionText, { color: text }, sortMode === 'newest' && styles.actionTextActive]}>Newest</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { borderBottomColor: border }]} onPress={() => { setSortMode('alpha_asc'); setSortModalVisible(false); }}>
                <Text style={[styles.actionText, { color: text }, sortMode === 'alpha_asc' && styles.actionTextActive]}>Alphabetical (A-Z)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { borderBottomColor: border }]} onPress={() => { setSortMode('items_desc'); setSortModalVisible(false); }}>
                <Text style={[styles.actionText, { color: text }, sortMode === 'items_desc' && styles.actionTextActive]}>Most Items</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: inputBg }]} onPress={() => setSortModalVisible(false)}>
                <Text style={[styles.cancelText, { color: text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* OPTIONS MODAL */}
        <Modal visible={isOptionsModalVisible} animationType="fade" transparent={true}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOptionsModalVisible(false)}>
            <View style={[styles.actionSheetContent, { backgroundColor: cardBg }]}>
              <View style={styles.actionSheetHeader}>
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

              <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: inputBg }]} onPress={() => setOptionsModalVisible(false)}>
                <Text style={[styles.cancelText, { color: text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  background: { flex: 1 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#F5A623', marginBottom: 2 }, // Orange
  folderCount: { fontSize: 14, color: COLORS.gray, fontWeight: '500' },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  searchRow: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 20, gap: 12 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.offWhite, borderRadius: 16, paddingHorizontal: 16, height: 50 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.dark, height: '100%' },
  sortButton: { width: 50, height: 50, borderRadius: 16, backgroundColor: COLORS.offWhite, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 24, paddingTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 16 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  folderCard: { 
    width: '47%', 
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    padding: 16, 
    ...SHADOWS.small, 
    borderWidth: 1, 
    borderColor: '#F0F0F0',
    marginBottom: 8
  },
  folderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  optionsBtn: { padding: 4, marginRight: -4, marginTop: -4 },
  folderIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  folderName: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 4 },
  folderCount: { fontSize: 13, color: COLORS.gray, fontWeight: '500' },
  
  videoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 14, ...SHADOWS.small, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  videoThumb: { width: 60, height: 60, borderRadius: 12, backgroundColor: 'rgba(108,92,231,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  videoInfo: { flex: 1 },
  videoTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 4 },
  videoMeta: { fontSize: 13, color: COLORS.gray },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.gray, fontWeight: '500', textAlign: 'center' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, ...SHADOWS.large },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: COLORS.dark },
  closeModalBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.offWhite, justifyContent: 'center', alignItems: 'center' },
  inputLabel: { fontSize: 14, fontWeight: '700', color: COLORS.gray, marginBottom: 8 },
  modalInput: { backgroundColor: COLORS.offWhite, borderRadius: 16, paddingHorizontal: 16, height: 56, fontSize: 16, color: COLORS.dark, marginBottom: 24 },
  colorPickerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  colorCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  colorCircleSelected: { borderWidth: 3, borderColor: 'rgba(0,0,0,0.2)' },
  createBtn: { backgroundColor: COLORS.primary, borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  createBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  
  // Action Sheet Styles
  actionSheetContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, ...SHADOWS.large },
  actionSheetHeader: { alignItems: 'center', marginBottom: 16 },
  actionSheetTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  actionText: { fontSize: 16, color: COLORS.dark, fontWeight: '600' },
  actionTextActive: { color: COLORS.primary, fontWeight: '800' },
  cancelBtn: { marginTop: 16, paddingVertical: 16, alignItems: 'center', backgroundColor: COLORS.offWhite, borderRadius: 16 },
  cancelText: { fontSize: 16, fontWeight: '800', color: COLORS.dark },
});

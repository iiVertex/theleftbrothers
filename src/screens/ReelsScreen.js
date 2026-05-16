import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Dimensions, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import { COLORS, SHADOWS } from '../constants/theme';
import { useData } from '../context/DataContext';

const { width, height } = Dimensions.get('window');

const CRITERIA_OPTIONS = [
  { id: 'Shuffle', label: 'Shuffle', icon: 'shuffle-outline' },
  { id: 'Latest', label: 'Latest', icon: 'time-outline' },
  { id: 'Shortest', label: 'Shortest', icon: 'flash-outline' },
  { id: 'Longest', label: 'Longest', icon: 'hourglass-outline' },
  { id: 'Most Viewed', label: 'Most Viewed', icon: 'flame-outline' },
  { id: 'View All', label: 'View All', icon: 'albums-outline' },
];

export default function ReelsScreen() {
  const { settings, videos, folders } = useData();
  const [activeCriteria, setActiveCriteria] = useState('Shuffle');
  const [activeFolder, setActiveFolder] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrentVideoIndex(viewableItems[0].index);
  }).current;

  useEffect(() => {
    if (!isPlaying) return;
    let next = [...videos];
    if (activeFolder !== 'all') {
      next = next.filter(v => v.folder_id === activeFolder);
    }
    if (activeCriteria === 'Shuffle') {
      next.sort(() => Math.random() - 0.5);
    } else if (activeCriteria === 'Latest') {
      next.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    setFilteredVideos(next);
    setCurrentVideoIndex(0);
  }, [isPlaying, videos, activeFolder, activeCriteria]);

  const folderChips = [{ id: 'all', name: 'All', icon: 'apps' }, ...folders];

  const isDark = settings?.isDarkMode;
  const bg = isDark ? '#121212' : COLORS.white;
  const cardBg = isDark ? '#1E1E1E' : COLORS.white;
  const text = isDark ? COLORS.white : COLORS.dark;
  const subText = isDark ? '#A0A0A0' : COLORS.gray;
  const border = isDark ? '#333333' : '#F0F0F0';
  const iconBg = isDark ? '#2C2C2C' : '#F0F0F5';

  const renderVideoItem = ({ item, index }) => (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri: item.video_url }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay={index === currentVideoIndex}
        isLooping
        useNativeControls={false}
      />
      <View style={styles.videoOverlay}>
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{item.title || 'Untitled'}</Text>
          {!!item.description && <Text style={styles.videoDescription}>{item.description}</Text>}
        </View>
        <View style={styles.videoActions}>
          <TouchableOpacity style={styles.actionIcon}><Ionicons name="heart" size={32} color={COLORS.white} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}><Ionicons name="share-social" size={32} color={COLORS.white} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}><Ionicons name="ellipsis-vertical" size={32} color={COLORS.white} /></TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isPlaying || isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFB74D' : '#F5A623' }]}>Discover</Text>
          <Text style={[styles.headerSubtitle, { color: subText }]}>What do you want to watch today?</Text>
        </View>

        {/* Sort Criteria */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>Sort By</Text>
          <View style={styles.gridContainer}>
            {CRITERIA_OPTIONS.map((item) => {
              const isActive = activeCriteria === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.criteriaCard,
                    { backgroundColor: cardBg, borderColor: border },
                    isActive && styles.criteriaCardActive,
                  ]}
                  onPress={() => setActiveCriteria(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.criteriaIcon, { backgroundColor: isActive ? '#F5A623' : iconBg }]}>
                    <Ionicons name={item.icon} size={22} color={isActive ? COLORS.white : COLORS.primary} />
                  </View>
                  <Text style={[styles.criteriaText, { color: isActive ? '#F5A623' : text }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* From Folder */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>From Folder</Text>
          <View style={styles.chipWrap}>
            {folderChips.map((f) => {
              const isActive = activeFolder === f.id;
              const chipColor = f.id === 'all' ? COLORS.primary : (f.color || COLORS.primary);
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[
                    styles.chip,
                    { backgroundColor: cardBg, borderColor: border },
                    isActive && { backgroundColor: '#F5A623', borderColor: '#F5A623' },
                  ]}
                  onPress={() => setActiveFolder(f.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={f.icon || 'folder'}
                    size={16}
                    color={isActive ? COLORS.white : chipColor}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.chipText, { color: isActive ? COLORS.white : text }]}>{f.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Start Watching Button (floats above the tab bar) */}
      <View style={styles.playButtonContainer}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => setIsPlaying(true)}>
          <LinearGradient
            colors={['#F5A623', '#FFC061']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.playButton}
          >
            <Ionicons name="play" size={22} color={COLORS.white} />
            <Text style={styles.playButtonText}>Start Watching</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Full Screen Reel Player */}
      <Modal visible={isPlaying} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          {filteredVideos.length === 0 ? (
            <View style={styles.videoPlaceholder}>
              <Ionicons name="videocam-off-outline" size={72} color="rgba(255,255,255,0.5)" />
              <Text style={styles.videoTempText}>No videos found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredVideos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
            />
          )}
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsPlaying(false)}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Header (matches Folders / Profile screens)
  headerContainer: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 8 },
  headerTitle: { fontSize: 32, fontWeight: '800', marginBottom: 2 },
  headerSubtitle: { fontSize: 14, fontWeight: '500' },

  // Sections
  section: { paddingHorizontal: 24, marginTop: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },

  // Criteria grid (matches Folders folder cards)
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  criteriaCard: {
    width: '47%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    ...SHADOWS.small,
  },
  criteriaCardActive: { borderColor: '#F5A623' },
  criteriaIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  criteriaText: { fontSize: 15, fontWeight: '700' },

  // Folder chips
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '600' },

  // Start Watching button
  playButtonContainer: { position: 'absolute', bottom: 116, left: 24, right: 24 },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    gap: 10,
    ...SHADOWS.medium,
  },
  playButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },

  // Full screen player
  modalContainer: { flex: 1, backgroundColor: '#000' },
  videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  videoTempText: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginTop: 16 },
  videoContainer: { width, height, backgroundColor: '#000' },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  videoInfo: { flex: 1, marginRight: 20 },
  videoTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  videoDescription: { color: COLORS.white, fontSize: 14 },
  videoActions: { alignItems: 'center' },
  actionIcon: { marginBottom: 20 },
  closeModalBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity,
  Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { useData } from '../context/DataContext';
import ReelItem from '../components/ReelItem';

const CRITERIA_OPTIONS = [
  { id: 'Shuffle', label: 'Shuffle', icon: 'shuffle-outline' },
  { id: 'Latest', label: 'Latest', icon: 'time-outline' },
  { id: 'Oldest', label: 'Oldest', icon: 'arrow-up-outline' },
  { id: 'View All', label: 'View All', icon: 'albums-outline' },
];

export default function ReelsScreen() {
  const { settings, videos, folders, recordView } = useData();
  const [activeCriteria, setActiveCriteria] = useState('Shuffle');
  const [activeFolder, setActiveFolder] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // FlatList forbids changing these props between renders, so they live in refs.
  // recordView is reached through a ref so the stable handler always sees the latest.
  const recordViewRef = useRef(recordView);
  recordViewRef.current = recordView;
  const countedRef = useRef(new Set()); // reel ids already counted this play session

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const visible = viewableItems[0];
      setCurrentVideoIndex(visible.index);
      const reelId = visible.item?.id;
      if (reelId && !countedRef.current.has(reelId)) {
        countedRef.current.add(reelId);
        recordViewRef.current(reelId);
      }
    }
  }).current;

  useEffect(() => {
    if (!isPlaying) return;
    let next = [...videos];
    if (activeFolder !== 'all') next = next.filter(v => v.folder_id === activeFolder);

    if (activeCriteria === 'Shuffle') {
      // Fisher-Yates — unbiased shuffle
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
    } else if (activeCriteria === 'Latest') {
      next.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (activeCriteria === 'Oldest') {
      next.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    }
    // 'View All' → leave in default (created_at desc) order

    setFilteredVideos(next);
    setCurrentVideoIndex(0);
  }, [isPlaying, videos, activeFolder, activeCriteria]);

  const folderChips = [{ id: 'all', name: 'All', icon: 'apps' }, ...folders];

  const isDark = settings?.isDarkMode;
  const bg = isDark ? COLORS.darkBg : COLORS.bg1;
  const cardBg = isDark ? COLORS.darkCard : COLORS.white;
  const text = isDark ? COLORS.bg1 : COLORS.text1;
  const subText = isDark ? COLORS.darkSubText : COLORS.subText;
  const border = isDark ? COLORS.darkBorder : COLORS.border;

  const renderVideoItem = ({ item, index }) => (
    <ReelItem item={item} isActive={index === currentVideoIndex} />
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isPlaying || isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.headerContainer, { borderBottomColor: border }]}>
          <Text style={[styles.headerTitle, { color: text }]}>Discover</Text>
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
                    { backgroundColor: cardBg, borderColor: isActive ? COLORS.accent : border },
                    isActive && styles.criteriaCardActive,
                  ]}
                  onPress={() => setActiveCriteria(item.id)}
                  activeOpacity={0.75}
                >
                  <View style={[
                    styles.criteriaIcon,
                    { backgroundColor: isActive ? COLORS.accent : (isDark ? COLORS.darkBorder : COLORS.bg2) },
                  ]}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={isActive ? COLORS.bg1 : subText}
                    />
                  </View>
                  <Text style={[styles.criteriaText, { color: isActive ? COLORS.accent : text }]}>
                    {item.label}
                  </Text>
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
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[
                    styles.chip,
                    { backgroundColor: isActive ? COLORS.accent : cardBg, borderColor: isActive ? COLORS.accent : border },
                  ]}
                  onPress={() => setActiveFolder(f.id)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={f.icon || 'folder'}
                    size={14}
                    color={isActive ? COLORS.bg1 : subText}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.chipText, { color: isActive ? COLORS.bg1 : text }]}>{f.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Start Watching Button */}
      <View style={styles.playButtonContainer}>
        <TouchableOpacity
          style={styles.playButton}
          activeOpacity={0.85}
          onPress={() => { countedRef.current = new Set(); setIsPlaying(true); }}
        >
          <Ionicons name="play" size={20} color={COLORS.bg1} />
          <Text style={styles.playButtonText}>Start Watching</Text>
        </TouchableOpacity>
      </View>

      {/* Full Screen Reel Player */}
      <Modal visible={isPlaying} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          {filteredVideos.length === 0 ? (
            <View style={styles.videoPlaceholder}>
              <Ionicons name="videocam-off-outline" size={64} color="rgba(255,255,255,0.4)" />
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
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: { fontFamily: FONTS.serifBold, fontSize: 30, letterSpacing: 0, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, fontWeight: '500' },

  section: { paddingHorizontal: 24, marginTop: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 14, letterSpacing: FONTS.tracking.wide, textTransform: 'uppercase' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  criteriaCard: {
    width: '47.5%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 4,
    ...SHADOWS.small,
  },
  criteriaCardActive: {},
  criteriaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  criteriaText: { fontSize: 14, fontWeight: '700' },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },

  playButtonContainer: { position: 'absolute', bottom: 116, left: 24, right: 24 },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    gap: 10,
    ...SHADOWS.medium,
  },
  playButtonText: { color: COLORS.bg1, fontSize: 16, fontWeight: '700' },

  // Full screen player (stays dark — it's a video experience)
  modalContainer: { flex: 1, backgroundColor: '#000' },
  videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  videoTempText: { color: COLORS.white, fontSize: 16, fontWeight: '600', marginTop: 16 },
  closeModalBtn: {
    position: 'absolute',
    top: 52,
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

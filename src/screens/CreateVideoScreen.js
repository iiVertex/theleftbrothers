import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { useData } from '../context/DataContext';
import { saveVideoLocally, saveImageLocally, saveAudioLocally } from '../utils/videoStorage';
import FramingModal from '../components/FramingModal';

const DEFAULT_FRAMING = { display_fit: 'cover', focus_x: 0.5, focus_y: 0.5 };

const aspectOf = (asset) =>
  asset?.width && asset?.height ? asset.width / asset.height : null;

export default function CreateVideoScreen({ navigation }) {
  const [mediaCategory, setMediaCategory] = useState('video'); // 'video' | 'image_audio'
  const [activeTab, setActiveTab] = useState('upload'); // video sub-mode: 'upload' | 'record'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folder, setFolder] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Video
  const [videoUri, setVideoUri] = useState(null);
  const [videoMime, setVideoMime] = useState(null);
  const [videoAspect, setVideoAspect] = useState(null);

  // Image + audio
  const [imageUri, setImageUri] = useState(null);
  const [imageMime, setImageMime] = useState(null);
  const [imageAspect, setImageAspect] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [audioMime, setAudioMime] = useState(null);
  const [audioName, setAudioName] = useState(null);

  // Framing (applies to the visual media — video or image)
  const [framing, setFraming] = useState(DEFAULT_FRAMING);
  const [framingVisible, setFramingVisible] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  const { settings, folders, addVideo } = useData();

  const isDark = settings?.isDarkMode;
  const bg = isDark ? COLORS.darkBg : COLORS.bg1;
  const cardBg = isDark ? COLORS.darkCard : COLORS.white;
  const text = isDark ? COLORS.bg1 : COLORS.text1;
  const subText = isDark ? COLORS.darkSubText : COLORS.subText;
  const border = isDark ? COLORS.darkBorder : COLORS.border;
  const inputBg = isDark ? COLORS.darkCard : COLORS.white;
  const toggleBg = isDark ? COLORS.darkBorder : COLORS.bg2;

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false, // our FramingModal controls the crop, not the OS editor
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setVideoUri(asset.uri);
      setVideoMime(asset.mimeType || null);
      setVideoAspect(aspectOf(asset));
      setFraming(DEFAULT_FRAMING);
    }
  };

  const recordVideo = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Recording is not available on web. Please use Upload instead.');
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to record a video.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 180,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setVideoUri(asset.uri);
      setVideoMime(asset.mimeType || null);
      setVideoAspect(aspectOf(asset));
      setFraming(DEFAULT_FRAMING);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageMime(asset.mimeType || null);
      setImageAspect(aspectOf(asset));
      setFraming(DEFAULT_FRAMING);
    }
  };

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      setAudioUri(asset.uri);
      setAudioMime(asset.mimeType || null);
      setAudioName(asset.name || 'Audio file');
    }
  };

  // The visual media currently selected (used by the framing step).
  const visualUri = mediaCategory === 'video' ? videoUri : imageUri;
  const visualAspect = mediaCategory === 'video' ? videoAspect : imageAspect;

  const saveReel = async () => {
    const hasVisual = !!visualUri;
    if (!hasVisual || !title || !folder) {
      Alert.alert('Missing Fields', 'Please provide media, a title, and select a folder.');
      return;
    }
    if (mediaCategory === 'image_audio' && !audioUri) {
      Alert.alert('Missing Audio', 'Please select an audio file to go with the image.');
      return;
    }

    setIsUploading(true);
    try {
      const common = {
        title,
        description,
        parentId: folder?.id || 'root',
        display_fit: framing.display_fit,
        focus_x: framing.focus_x,
        focus_y: framing.focus_y,
        aspect_ratio: visualAspect,
      };

      let payload;
      if (mediaCategory === 'video') {
        const storedVideo = await saveVideoLocally(videoUri, videoMime || 'video/mp4');
        payload = { ...common, media_type: 'video', video_url: storedVideo };
      } else {
        const storedImage = await saveImageLocally(imageUri, imageMime || 'image/jpeg');
        const storedAudio = await saveAudioLocally(audioUri, audioMime || 'audio/mpeg');
        payload = { ...common, media_type: 'image_audio', image_url: storedImage, audio_url: storedAudio };
      }

      const { error: dbError } = await addVideo(payload);
      if (dbError) throw dbError;

      Alert.alert('Success', 'Reel saved!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Save Failed', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const fitLabel = framing.display_fit === 'contain' ? 'Whole media' : 'Filled / cropped';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Add Reel</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.pageSubtitle, { color: subText }]}>Choose what kind of reel to add</Text>

          {/* Media-type selector */}
          <View style={[styles.toggleContainer, { backgroundColor: toggleBg }]}>
            {[
              { key: 'video', label: 'Video', icon: 'film-outline' },
              { key: 'image_audio', label: 'Image + Audio', icon: 'musical-notes-outline' },
            ].map(({ key, label, icon }) => (
              <TouchableOpacity
                key={key}
                style={[styles.toggleBtn, mediaCategory === key && styles.toggleBtnActive]}
                onPress={() => setMediaCategory(key)}
              >
                <Ionicons name={icon} size={18} color={mediaCategory === key ? COLORS.bg1 : text} />
                <Text style={[styles.toggleText, { color: mediaCategory === key ? COLORS.bg1 : text }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {mediaCategory === 'video' ? (
            <>
              {/* Upload / Record sub-toggle */}
              <View style={[styles.subToggleContainer, { backgroundColor: toggleBg }]}>
                {[
                  { key: 'upload', label: 'Upload', icon: 'cloud-upload-outline' },
                  { key: 'record', label: 'Record', icon: 'videocam-outline' },
                ].map(({ key, label, icon }) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.toggleBtn, activeTab === key && styles.toggleBtnActive]}
                    onPress={() => setActiveTab(key)}
                  >
                    <Ionicons name={icon} size={18} color={activeTab === key ? COLORS.bg1 : text} />
                    <Text style={[styles.toggleText, { color: activeTab === key ? COLORS.bg1 : text }]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Video pick zone */}
              <TouchableOpacity
                style={[styles.uploadZone, { backgroundColor: isDark ? COLORS.darkCard : COLORS.bg2, borderColor: border }]}
                onPress={activeTab === 'upload' ? pickVideo : recordVideo}
              >
                <View style={[styles.uploadIconWrapper, { backgroundColor: isDark ? COLORS.darkBorder : COLORS.bg3 }]}>
                  <Ionicons
                    name={videoUri ? 'checkmark-circle' : (activeTab === 'upload' ? 'cloud-upload-outline' : 'videocam-outline')}
                    size={28}
                    color={videoUri ? COLORS.success : subText}
                  />
                </View>
                <Text style={[styles.uploadMainText, { color: text }]}>
                  {videoUri ? 'Video Selected' : (activeTab === 'upload' ? 'Tap to select a video' : 'Tap to start recording')}
                </Text>
                <Text style={[styles.uploadSubText, { color: subText }]}>
                  {videoUri ? 'Tap to change' : (activeTab === 'upload' ? 'MP4, MOV, WebM' : 'Max duration: 3 mins')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Image pick zone */}
              <TouchableOpacity
                style={[styles.uploadZone, { backgroundColor: isDark ? COLORS.darkCard : COLORS.bg2, borderColor: border }]}
                onPress={pickImage}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
                ) : (
                  <View style={[styles.uploadIconWrapper, { backgroundColor: isDark ? COLORS.darkBorder : COLORS.bg3 }]}>
                    <Ionicons name="image-outline" size={28} color={subText} />
                  </View>
                )}
                <Text style={[styles.uploadMainText, { color: text }]}>
                  {imageUri ? 'Image Selected' : 'Tap to select an image'}
                </Text>
                <Text style={[styles.uploadSubText, { color: subText }]}>
                  {imageUri ? 'Tap to change' : 'JPG, PNG, WebP'}
                </Text>
              </TouchableOpacity>

              {/* Audio pick row */}
              <TouchableOpacity
                style={[styles.audioRow, { backgroundColor: inputBg, borderColor: border }]}
                onPress={pickAudio}
              >
                <Ionicons
                  name={audioUri ? 'musical-note' : 'musical-notes-outline'}
                  size={20}
                  color={audioUri ? COLORS.success : subText}
                />
                <Text style={[styles.audioText, { color: audioUri ? text : subText }]} numberOfLines={1}>
                  {audioUri ? audioName : 'Tap to select an audio file (MP3)'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={subText} />
              </TouchableOpacity>
            </>
          )}

          {/* Framing control — visible once a video/image is chosen */}
          {visualUri && (
            <TouchableOpacity
              style={[styles.framingRow, { backgroundColor: inputBg, borderColor: border }]}
              onPress={() => setFramingVisible(true)}
            >
              <Ionicons name="crop-outline" size={20} color={subText} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.framingTitle, { color: text }]}>Framing</Text>
                <Text style={[styles.framingSub, { color: subText }]}>{fitLabel}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={subText} />
            </TouchableOpacity>
          )}

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: subText }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: border, color: text }]}
              placeholder="e.g., How blood circulates"
              placeholderTextColor={subText}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: subText }]}>Description <Text style={{ fontWeight: '400' }}>(optional)</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: inputBg, borderColor: border, color: text }]}
              placeholder="Brief description..."
              placeholderTextColor={subText}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: subText }]}>Folder</Text>
            <TouchableOpacity
              style={[styles.dropdownToggle, { backgroundColor: inputBg, borderColor: border }]}
              onPress={() => setShowDropdown(!showDropdown)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, { color: folder ? text : subText }]}>
                {folder ? folder.name : 'Select Folder'}
              </Text>
              <Ionicons name={showDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={subText} />
            </TouchableOpacity>

            {showDropdown && (
              <View style={[styles.dropdownMenu, { backgroundColor: cardBg, borderColor: border }]}>
                {folders.filter(f => f.id !== 'root').map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.dropdownItem, { borderBottomColor: border }]}
                    onPress={() => { setFolder(item); setShowDropdown(false); }}
                  >
                    <Text style={[styles.dropdownItemText, { color: text }]}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer / Save Button */}
      <View style={[styles.footer, { backgroundColor: bg, borderTopColor: border }]}>
        <TouchableOpacity
          style={[styles.saveButton, isUploading && { opacity: 0.6 }]}
          onPress={saveReel}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color={COLORS.bg1} />
          ) : (
            <Text style={styles.saveButtonText}>Save Reel</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Framing editor */}
      {framingVisible && visualUri && (
        <FramingModal
          visible={framingVisible}
          mediaType={mediaCategory === 'video' ? 'video' : 'image'}
          uri={visualUri}
          aspectRatio={visualAspect}
          initial={framing}
          onCancel={() => setFramingVisible(false)}
          onDone={(next) => { setFraming(next); setFramingVisible(false); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 14, fontWeight: '700', letterSpacing: FONTS.tracking.wide, textTransform: 'uppercase' },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  pageSubtitle: { fontSize: 14, fontWeight: '500', marginBottom: 20 },

  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  subToggleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 11,
    gap: 7,
  },
  toggleBtnActive: { backgroundColor: COLORS.accent },
  toggleText: { fontSize: 14, fontWeight: '700' },

  uploadZone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  imagePreview: {
    width: 84,
    height: 84,
    borderRadius: 16,
    marginBottom: 14,
  },
  uploadMainText: { fontSize: 15, fontWeight: '700', marginBottom: 5 },
  uploadSubText: { fontSize: 13, fontWeight: '400' },

  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  audioText: { flex: 1, fontSize: 14, fontWeight: '600' },

  framingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 64,
    marginBottom: 8,
  },
  framingTitle: { fontSize: 14, fontWeight: '700' },
  framingSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },

  formGroup: { marginBottom: 18, marginTop: 10 },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: FONTS.tracking.tight, textTransform: 'uppercase' },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
  },
  textArea: { height: 100, paddingTop: 14 },
  dropdownToggle: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: { fontSize: 15 },
  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: { fontSize: 15, fontWeight: '600' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { color: COLORS.bg1, fontSize: 16, fontWeight: '700' },
});

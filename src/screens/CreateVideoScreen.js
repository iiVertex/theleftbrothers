import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { useData } from '../context/DataContext';
import { saveVideoLocally } from '../utils/videoStorage';

export default function CreateVideoScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('upload');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folder, setFolder] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [videoMime, setVideoMime] = useState(null);
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
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
      setVideoMime(result.assets[0].mimeType || null);
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
      setVideoUri(result.assets[0].uri);
      setVideoMime(result.assets[0].mimeType || null);
    }
  };

  const uploadVideo = async () => {
    if (!videoUri || !title || !folder) {
      Alert.alert('Missing Fields', 'Please provide a video, title, and select a folder.');
      return;
    }
    setIsUploading(true);
    try {
      // Copy the picked/recorded file into persistent on-device storage and
      // store its relative name; only the metadata row goes to Supabase.
      const storedUrl = await saveVideoLocally(videoUri, videoMime || 'video/mp4');

      const { error: dbError } = await addVideo(title, description, storedUrl, folder?.id || 'root');
      if (dbError) throw dbError;

      Alert.alert('Success', 'Video saved!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Save Failed', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Add Video</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.pageSubtitle, { color: subText }]}>Record or upload your video</Text>

          {/* Toggle Tabs */}
          <View style={[styles.toggleContainer, { backgroundColor: toggleBg }]}>
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

          {/* Upload Zone */}
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
          onPress={uploadVideo}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color={COLORS.bg1} />
          ) : (
            <Text style={styles.saveButtonText}>Save Video</Text>
          )}
        </TouchableOpacity>
      </View>
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
    marginBottom: 24,
  },
  uploadIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  uploadMainText: { fontSize: 15, fontWeight: '700', marginBottom: 5 },
  uploadSubText: { fontSize: 13, fontWeight: '400' },

  formGroup: { marginBottom: 18 },
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

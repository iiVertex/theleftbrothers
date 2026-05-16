import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../utils/supabase';

import { COLORS } from '../constants/theme';
import { useData } from '../context/DataContext';

export default function CreateVideoScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'record'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folder, setFolder] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [videoMime, setVideoMime] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { settings, folders, addVideo } = useData();
  
  const isDark = settings?.isDarkMode;
  const bg = isDark ? '#121212' : COLORS.white;
  const cardBg = isDark ? '#1E1E1E' : COLORS.white;
  const text = isDark ? COLORS.white : COLORS.dark;
  const subText = isDark ? '#A0A0A0' : COLORS.gray;
  const border = isDark ? '#333333' : '#F0F0F0';
  const inputBorder = isDark ? '#444' : '#E8E8E8';
  const inputBg = isDark ? '#2C2C2C' : COLORS.white;
  const toggleBg = isDark ? '#2C2C2C' : COLORS.offWhite;
  const uploadBg = isDark ? '#1E1E1E' : '#FAFAFA';
  const uploadBorderColor = isDark ? '#444' : '#E8E8E8';
  const footerBg = isDark ? '#1E1E1E' : COLORS.white;

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

  const uploadVideo = async () => {
    if (!videoUri || !title || !folder) {
      Alert.alert("Missing Fields", "Please provide a video, title, and select a folder.");
      return;
    }

    setIsUploading(true);
    try {
      const mime = videoMime || 'video/mp4';
      const ext = (mime.split('/')[1] || 'mp4').toLowerCase();

      // 1. Read the picked video into an ArrayBuffer (platform-specific)
      let fileData;
      if (Platform.OS === 'web') {
        // On web the picked URI is a blob: URL — fetch reads it directly
        const response = await fetch(videoUri);
        fileData = await response.arrayBuffer();
      } else {
        // expo-file-system only works on native
        const base64File = await FileSystem.readAsStringAsync(videoUri, {
          encoding: 'base64',
        });
        fileData = decode(base64File);
      }

      // 2. Generate unique filename
      const filePath = `${Date.now()}.${ext}`;

      // 3. Upload to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('videos')
        .upload(filePath, fileData, {
          contentType: mime,
        });

      if (storageError) throw storageError;

      // 4. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);
        
      const videoUrl = publicUrlData.publicUrl;

      // 5. Save to Database via context
      const { error: dbError } = await addVideo(title, description, videoUrl, folder?.id || 'root');
      if (dbError) throw dbError;

      Alert.alert("Success", "Video uploaded successfully!");
      navigation.goBack();

    } catch (error) {
      console.error(error);
      Alert.alert("Upload Failed", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Titles */}
          <Text style={[styles.pageTitle, { color: text }]}>Add Video</Text>
          <Text style={[styles.pageSubtitle, { color: subText }]}>Record or upload your explanation</Text>

          {/* Toggle Tabs */}
          <View style={[styles.toggleContainer, { backgroundColor: toggleBg }]}>
            <TouchableOpacity 
              style={[styles.toggleBtn, activeTab === 'upload' && styles.toggleBtnActive]}
              onPress={() => setActiveTab('upload')}
            >
              <Ionicons name="cloud-upload-outline" size={20} color={activeTab === 'upload' ? COLORS.white : text} />
              <Text style={[styles.toggleText, { color: text }, activeTab === 'upload' && styles.toggleTextActive]}>Upload</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.toggleBtn, activeTab === 'record' && styles.toggleBtnActive]}
              onPress={() => setActiveTab('record')}
            >
              <Ionicons name="videocam-outline" size={20} color={activeTab === 'record' ? COLORS.white : text} />
              <Text style={[styles.toggleText, { color: text }, activeTab === 'record' && styles.toggleTextActive]}>Record</Text>
            </TouchableOpacity>
          </View>

          {/* Upload/Record Zone */}
          <TouchableOpacity 
            style={[styles.uploadZone, { backgroundColor: uploadBg, borderColor: uploadBorderColor }]}
            onPress={pickVideo}
          >
            <View style={styles.uploadIconWrapper}>
              <Ionicons name={videoUri ? 'checkmark-circle' : (activeTab === 'upload' ? 'cloud-upload' : 'videocam')} size={32} color={videoUri ? '#4CAF50' : '#E91E63'} />
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
            <Text style={[styles.label, { color: text }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]}
              placeholder="e.g., How blood circulates"
              placeholderTextColor={subText}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: text }]}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]}
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
            <Text style={[styles.label, { color: text }]}>Folder</Text>
            <TouchableOpacity 
              style={[styles.dropdownToggle, { backgroundColor: inputBg, borderColor: inputBorder }]}
              onPress={() => setShowDropdown(!showDropdown)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, { color: text }, !folder && { color: subText }]}>
                {folder ? folder.name : 'Select Folder'}
              </Text>
              <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color={subText} />
            </TouchableOpacity>
            
            {showDropdown && (
              <View style={[styles.dropdownMenu, { backgroundColor: cardBg, borderColor: inputBorder }]}>
                {folders.filter(f => f.id !== 'root').map((item) => (
                  <TouchableOpacity 
                    key={item.id}
                    style={[styles.dropdownItem, { borderBottomColor: border }]}
                    onPress={() => {
                      setFolder(item);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: text }]}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: footerBg, borderTopColor: border }]}>
        <TouchableOpacity 
            style={[styles.saveButton, isUploading && { opacity: 0.7 }]} 
            onPress={uploadVideo}
            disabled={isUploading}
        >
          {isUploading ? (
              <ActivityIndicator color={COLORS.white} />
          ) : (
              <Text style={styles.saveButtonText}>Save Video</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Make room for footer
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 15,
    color: COLORS.gray,
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.offWhite,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#F5A623', // Orange active tab
    elevation: 2,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  uploadZone: {
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    borderRadius: 24,
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 28,
    backgroundColor: '#FAFAFA',
  },
  uploadIconWrapper: {
    width: 56,
    height: 56,
    backgroundColor: '#FCE4EC', // Soft pink/purple to match design
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadMainText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 6,
  },
  uploadSubText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    fontSize: 15,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  dropdownToggle: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  dropdownText: {
    fontSize: 15,
    color: COLORS.dark,
  },
  dropdownMenu: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 15,
    color: COLORS.dark,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopWidth: 1,
  },
  saveButton: {
    backgroundColor: '#F5A623',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

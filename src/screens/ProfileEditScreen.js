import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../utils/supabase';
import { COLORS, FONTS } from '../constants/theme';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function ProfileEditScreen({ navigation }) {
  const { settings } = useData();
  const { user, updateProfile } = useAuth();

  const [username, setUsername] = useState(user?.user_metadata?.username || '');
  const [imageUri, setImageUri] = useState(null);
  const [imageMime, setImageMime] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isDark = settings?.isDarkMode;
  const bg = isDark ? COLORS.darkBg : COLORS.bg1;
  const cardBg = isDark ? COLORS.darkCard : COLORS.white;
  const text = isDark ? COLORS.bg1 : COLORS.text1;
  const subText = isDark ? COLORS.darkSubText : COLORS.subText;
  const border = isDark ? COLORS.darkBorder : COLORS.border;

  const currentAvatar = user?.user_metadata?.avatar_url;
  const previewUri = imageUri || currentAvatar;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageMime(result.assets[0].mimeType || null);
    }
  };

  const handleSave = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      Alert.alert('Missing Username', 'Please enter a username.');
      return;
    }
    setIsSaving(true);
    try {
      let avatarUrl;
      if (imageUri) {
        const mime = imageMime || 'image/jpeg';
        const ext = (mime.split('/')[1] || 'jpg').toLowerCase();

        let fileData;
        if (Platform.OS === 'web') {
          const response = await fetch(imageUri);
          fileData = await response.arrayBuffer();
        } else {
          const base64File = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
          fileData = decode(base64File);
        }

        const filePath = `${user.id}/${Date.now()}.${ext}`;
        const { error: storageError } = await supabase.storage
          .from('avatars')
          .upload(filePath, fileData, { contentType: mime });
        if (storageError) throw storageError;

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = publicUrlData.publicUrl;
      }

      const { error } = await updateProfile({ username: trimmed, avatarUrl });
      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Update Failed', error.message);
    } finally {
      setIsSaving(false);
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
        <Text style={[styles.headerTitle, { color: text }]}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Picture */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              <View style={[styles.avatarContainer, { backgroundColor: isDark ? COLORS.darkCard : COLORS.bg3, borderColor: border }]}>
                {previewUri ? (
                  <Image source={{ uri: previewUri }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={48} color={subText} />
                )}
                <View style={[styles.cameraBadge, { backgroundColor: COLORS.accent, borderColor: bg }]}>
                  <Ionicons name="camera" size={16} color={COLORS.bg1} />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage}>
              <Text style={[styles.changePhotoText, { color: subText }]}>Tap to change photo</Text>
            </TouchableOpacity>
          </View>

          {/* Username */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: subText }]}>Username</Text>
            <TextInput
              style={[styles.input, { backgroundColor: cardBg, borderColor: border, color: text }]}
              placeholder="Your username"
              placeholderTextColor={subText}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer / Save Button */}
      <View style={[styles.footer, { backgroundColor: bg, borderTopColor: border }]}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={COLORS.bg1} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
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
  scrollContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 55 },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: { fontSize: 13, fontWeight: '600' },

  formGroup: { marginBottom: 18 },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: FONTS.tracking.tight, textTransform: 'uppercase' },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
  },

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

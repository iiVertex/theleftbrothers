import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { supabase } from '../utils/supabase';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';

export default function ProfileEditScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const { settings } = useData();
  const [username, setUsername] = useState(user?.user_metadata?.username || '');
  const [avatarUri, setAvatarUri] = useState(user?.user_metadata?.avatar_url || '');
  const [saving, setSaving] = useState(false);

  const isDark = settings.isDarkMode;
  const bg = isDark ? '#121212' : COLORS.white;
  const text = isDark ? COLORS.white : COLORS.dark;
  const cardBg = isDark ? '#1E1E1E' : COLORS.white;
  const border = isDark ? '#333333' : '#F0F0F0';
  const subText = isDark ? '#A0A0A0' : '#8A8D9F';
  const inputBg = isDark ? '#2C2C2C' : '#F7F7F7';
  const currentEmail = user?.email || '';

  const pickAvatarImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.length) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (localUri) => {
    const response = await fetch(localUri);
    const blob = await response.blob();
    const mimeType = blob.type || 'image/jpeg';
    const extension = mimeType.includes('png') ? 'png' : 'jpg';
    const filePath = `${user.id}/avatar.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        upsert: true,
        contentType: mimeType,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSaveChanges = async () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      Alert.alert('Missing username', 'Please enter a username before saving.');
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = user?.user_metadata?.avatar_url || '';

      if (avatarUri && avatarUri !== avatarUrl) {
        avatarUrl = await uploadAvatar(avatarUri);
      }

      const { error } = await updateProfile({
        username: trimmedUsername,
        avatar_url: avatarUrl,
      });

      if (error) {
        Alert.alert('Save failed', error.message || 'Please try again.');
        return;
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Save failed', error?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: bg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSaveChanges} style={styles.saveButton}>
          <Text style={[styles.saveButtonText, { color: COLORS.primary }]}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarSection}>
          <View style={[styles.avatarContainer, { backgroundColor: 'rgba(108, 92, 231, 0.1)' }]}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={60} color={COLORS.primaryLight} />
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={pickAvatarImage} activeOpacity={0.85}>
              <Ionicons name="camera" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.avatarHint, { color: subText }]}>Tap the camera to upload a profile picture</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: subText }]}>Username</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor={subText}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: subText }]}>Email</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput, { backgroundColor: isDark ? '#262626' : '#EEEEEE', color: subText, borderColor: border }]}
              value={currentEmail}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Email cannot be changed"
              placeholderTextColor={subText}
            />
            <Text style={[styles.helperText, { color: subText }]}>Email cannot be changed here.</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    ...SHADOWS.small,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
  helperText: {
    marginTop: 8,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarHint: {
    marginTop: 10,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  formSection: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  readOnlyInput: {
    opacity: 0.9,
  },
});

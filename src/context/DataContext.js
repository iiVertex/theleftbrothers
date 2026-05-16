import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    views: 126,
    streakDays: 5,
    streakWeeks: 3,
    streakMonths: 1
  });
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    isDarkMode: false,
    dailyVideoLimit: 10,
    nightTimeLimit: '22:00' // 10 PM
  });

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setFolders([]);
      setVideos([]);
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const foldersResponse = await supabase.from('folders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (foldersResponse.data) setFolders(foldersResponse.data);

      const videosResponse = await supabase.from('reels').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (videosResponse.data) setVideos(videosResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFolder = async (name, color, icon, parentId = 'root') => {
    if (!user) return;
    const newFolder = {
      name,
      color: color || '#6C5CE7',
      icon: icon || 'folder',
      parentId,
      user_id: user.id
    };
    
    // Optimistic UI Update
    const tempId = Date.now().toString();
    setFolders([{ id: tempId, ...newFolder }, ...folders]);

    const { data, error } = await supabase.from('folders').insert([newFolder]).select();
    if (!error && data) {
      setFolders(prev => prev.map(f => f.id === tempId ? data[0] : f));
    } else {
      console.error("Error adding folder - Rolling back", error);
      setFolders(prev => prev.filter(f => f.id !== tempId));
    }
  };

  const addVideo = async (title, description, video_url, parentId = null) => {
    if (!user) return { error: { message: 'You must be signed in to add a video.' } };
    const folderId = parentId === 'root' ? null : parentId;
    const newVideo = {
      title,
      description,
      folder_id: folderId,
      video_url,
      user_id: user.id
    };

    const tempId = Date.now().toString();
    setVideos([{ id: tempId, ...newVideo }, ...videos]);

    const { data, error } = await supabase.from('reels').insert([newVideo]).select();
    if (!error && data) {
      setVideos(prev => prev.map(v => v.id === tempId ? data[0] : v));
    } else {
      console.error("Error adding video - Rolling back", error);
      setVideos(prev => prev.filter(v => v.id !== tempId));
    }
    return { data, error };
  };

  const deleteFolder = async (folderId) => {
    if (!user) return;
    
    setFolders(prev => prev.filter(f => f.id !== folderId && f.parentId !== folderId));
    setVideos(prev => prev.filter(v => v.folder_id !== folderId));
    
    // Using 'reels' table
    await supabase.from('reels').delete().eq('folder_id', folderId);
    await supabase.from('folders').delete().eq('id', folderId);
  };

  const deleteVideo = async (videoId) => {
    if (!user) return;
    setVideos(prev => prev.filter(v => v.id !== videoId));
    await supabase.from('reels').delete().eq('id', videoId);
  };

  const updateFolder = async (folderId, newName, newColor) => {
    if (!user) return;
    setFolders(prev => prev.map(f => {
      if (f.id === folderId) {
        return { ...f, name: newName || f.name, color: newColor || f.color };
      }
      return f;
    }));

    await supabase.from('folders').update({ name: newName, color: newColor }).eq('id', folderId);
  };

  const getFolderItemCount = (folderId) => {
    const subFoldersCount = folders.filter(f => f.parentId === folderId).length;
    const videosCount = videos.filter(v => v.folder_id === folderId).length;
    return subFoldersCount + videosCount;
  };

  return (
    <DataContext.Provider value={{ 
      folders, videos, userStats, setUserStats, settings, setSettings, loading,
      addFolder, addVideo, 
      deleteFolder, deleteVideo, updateFolder,
      getFolderItemCount 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

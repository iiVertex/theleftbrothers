import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { deleteLocalVideo } from '../utils/videoStorage';

// Remove every on-device file backing a reel (video, or image + audio).
const deleteReelFiles = (reel) => {
  if (!reel) return;
  deleteLocalVideo(reel.video_url);
  deleteLocalVideo(reel.image_url);
  deleteLocalVideo(reel.audio_url);
};
import { computeCurrentStreak, dayKey } from '../utils/streak';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [videos, setVideos] = useState([]);
  const [viewActivity, setViewActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    views: 0,
    streakDays: 0,
    streakWeeks: 0,
    streakMonths: 0
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
      setViewActivity([]);
    }
  }, [user]);

  // Local 'YYYY-MM-DD' for a Date (avoids UTC shift from toISOString).
  const localDateKey = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const foldersResponse = await supabase.from('folders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (foldersResponse.data) setFolders(foldersResponse.data);

      const videosResponse = await supabase.from('reels').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (videosResponse.data) setVideos(videosResponse.data);

      // Reel views for the current calendar month, aggregated per local day.
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const viewsResponse = await supabase
        .from('reel_views')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', monthStart.toISOString())
        .lt('created_at', nextMonth.toISOString());
      if (viewsResponse.data) {
        const counts = {};
        viewsResponse.data.forEach(({ created_at }) => {
          const key = localDateKey(created_at);
          counts[key] = (counts[key] || 0) + 1;
        });
        setViewActivity(Object.entries(counts).map(([date, count]) => ({ date, count })));
      }

      // Current streak needs history beyond the calendar month (so it can span
      // month boundaries), so query a wider window of view days separately.
      const streakWindowStart = new Date(now);
      streakWindowStart.setDate(streakWindowStart.getDate() - 400);
      const streakResponse = await supabase
        .from('reel_views')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', streakWindowStart.toISOString());
      const streakRows = streakResponse.data || [];
      const activeDays = new Set(streakRows.map(({ created_at }) => dayKey(created_at)));
      setUserStats(prev => ({
        ...prev,
        streakDays: computeCurrentStreak(activeDays),
        views: streakRows.length,
      }));
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

  const addVideo = async ({
    title,
    description,
    parentId = null,
    media_type = 'video',
    video_url = null,
    image_url = null,
    audio_url = null,
    display_fit = 'cover',
    focus_x = 0.5,
    focus_y = 0.5,
    aspect_ratio = null,
  }) => {
    if (!user) return { error: { message: 'You must be signed in to add a video.' } };
    const folderId = parentId === 'root' ? null : parentId;
    const newVideo = {
      title,
      description,
      folder_id: folderId,
      media_type,
      video_url,
      image_url,
      audio_url,
      display_fit,
      focus_x,
      focus_y,
      aspect_ratio,
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

  const recordView = async (reelId) => {
    if (!user) return;
    // Optimistically bump today's count so the heat map updates live.
    const todayKey = localDateKey(new Date());
    const firstViewToday = !viewActivity.some(d => d.date === todayKey);

    setViewActivity(prev => {
      const existing = prev.find(d => d.date === todayKey);
      if (existing) {
        return prev.map(d => d.date === todayKey ? { ...d, count: d.count + 1 } : d);
      }
      return [...prev, { date: todayKey, count: 1 }];
    });
    // First reel of the day extends the streak by one (whether it was alive
    // yesterday or starting fresh today, the new current streak is prev + 1).
    setUserStats(prev => ({
      ...prev,
      views: (prev.views || 0) + 1,
      streakDays: firstViewToday ? (prev.streakDays || 0) + 1 : prev.streakDays,
    }));

    const { error } = await supabase.from('reel_views').insert([{ user_id: user.id, reel_id: reelId || null }]);
    if (error) {
      console.error('Error recording view - Rolling back', error);
      setViewActivity(prev => prev
        .map(d => d.date === todayKey ? { ...d, count: d.count - 1 } : d)
        .filter(d => d.count > 0));
      setUserStats(prev => ({
        ...prev,
        views: Math.max(0, (prev.views || 0) - 1),
        streakDays: firstViewToday ? Math.max(0, (prev.streakDays || 0) - 1) : prev.streakDays,
      }));
    }
  };

  const deleteFolder = async (folderId) => {
    if (!user) return;
    
    setFolders(prev => prev.filter(f => f.id !== folderId && f.parentId !== folderId));
    // Remove on-device files for the reels in this folder before dropping them.
    videos.filter(v => v.folder_id === folderId).forEach(deleteReelFiles);
    setVideos(prev => prev.filter(v => v.folder_id !== folderId));

    // Using 'reels' table
    await supabase.from('reels').delete().eq('folder_id', folderId);
    await supabase.from('folders').delete().eq('id', folderId);
  };

  const deleteVideo = async (videoId) => {
    if (!user) return;
    const target = videos.find(v => v.id === videoId);
    setVideos(prev => prev.filter(v => v.id !== videoId));
    if (target) deleteReelFiles(target);
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
      folders, videos, viewActivity, userStats, setUserStats, settings, setSettings, loading,
      addFolder, addVideo, recordView,
      deleteFolder, deleteVideo, updateFolder,
      getFolderItemCount
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

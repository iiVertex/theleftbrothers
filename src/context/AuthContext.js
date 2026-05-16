import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
  };

  const signUp = async (email, password, options) => {
    return await supabase.auth.signUp({
      email: email.trim(),
      password,
      options,
    });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const updateProfile = async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (!error && data?.user) {
      setUser(data.user);
      setSession((currentSession) =>
        currentSession ? { ...currentSession, user: data.user } : currentSession
      );
    }

    return { data, error };
  };

  const updateProfileAvatar = async (avatarUrl) => {
    return await updateProfile({ avatar_url: avatarUrl });
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut, updateProfile, updateProfileAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

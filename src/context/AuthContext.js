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

  // Updates the user's metadata. The onAuthStateChange subscription above
  // receives the USER_UPDATED event and refreshes `user` automatically.
  const updateProfile = async ({ username, avatarUrl }) => {
    const data = {};
    if (username !== undefined) data.username = username;
    if (avatarUrl !== undefined) data.avatar_url = avatarUrl;
    return await supabase.auth.updateUser({ data });
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

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

  // Confirms a sign-up with the 6-digit code emailed by Supabase. On success a
  // session is created and the onAuthStateChange subscription above refreshes
  // `session`/`user` automatically.
  const verifyOtp = async (email, token) => {
    return await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'signup',
    });
  };

  // Re-sends the sign-up confirmation code to the given email.
  const resendSignupOtp = async (email) => {
    return await supabase.auth.resend({ type: 'signup', email: email.trim() });
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
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut, updateProfile, verifyOtp, resendSignupOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

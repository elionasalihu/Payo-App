import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { isSupabaseConfigured, supabase } from "../components/supabase/client";
import { fetchProfile } from "../components/supabase/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [recovering, setRecovering] = useState(false);

  const user = session?.user ?? null;

  // Session bootstrap + listener
  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (!data.session) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const loadProfile = useCallback(async () => {
    if (!user) return null;
    try {
      const data = await fetchProfile(user.id);
      const fallback = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
        role: "user",
      };
      setProfile(data || fallback);
      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[Payo] Could not load profile:", error.message);
      setProfile({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "",
        role: "user",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load profile whenever the signed-in user changes
  const userId = user?.id;
  useEffect(() => {
    if (userId) loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async ({ fullName, email, password }) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/client`,
      },
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      recovering,
      setRecovering,
      isAdmin: profile?.role === "admin",
      configured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      refreshProfile: loadProfile,
      setProfile,
    }),
    [session, user, profile, loading, recovering, signIn, signUp, signOut, sendPasswordReset, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

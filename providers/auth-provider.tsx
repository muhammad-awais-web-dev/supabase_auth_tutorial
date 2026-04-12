"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/database.types";

type Profile = Tables<"profiles">;
type Role = Tables<"user_roles">["role"];

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: Role | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => ReturnType<typeof supabase.auth.signInWithPassword>;
  signUpWithPassword: (email: string, password: string) => ReturnType<typeof supabase.auth.signUp>;
  signOut: () => Promise<void>;
};

const supabase = createClient();

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateAuthData = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);

    if (!nextSession) {
      setProfile(null);
      setRole(null);
      setIsLoading(false);
      return;
    }

    const userId = nextSession.user.id;
    const [{ data: profileData }, { data: roleData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("id", userId).maybeSingle(),
    ]);

    setProfile(profileData ?? null);
    setRole(roleData?.role ?? null);
    setIsLoading(false);
  }, []);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await hydrateAuthData(data.session ?? null);
  }, [hydrateAuthData]);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        await hydrateAuthData(data.session ?? null);
      }
    };

    hydrateSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void hydrateAuthData(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [hydrateAuthData]);

  const signInWithPassword = useCallback((email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signUpWithPassword = useCallback((email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setRole(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      role,
      isLoading,
      refreshSession,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    }),
    [
      isLoading,
      profile,
      refreshSession,
      role,
      session,
      signInWithPassword,
      signOut,
      signUpWithPassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldTitle,
  Field,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Profile = Tables<"profiles">;
type Role = Tables<"user_roles">["role"];

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: Role | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  signInWithPassword: (
    email: string,
    password: string,
  ) => ReturnType<typeof supabase.auth.signInWithPassword>;
  signUpWithPassword: (
    email: string,
    password: string,
  ) => ReturnType<typeof supabase.auth.signUp>;
  signOut: () => Promise<void>;
};

const supabase = createClient();

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userNameError, setUserNameError] = useState<string | null>(null);

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
    if (profileData.avatar_url===null) {
      profileData.avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.display_name || profileData.username || "User")}&background=random&color=fff`;
    }
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

  const updateProfile = async (updatedProfile: Partial<Profile>) => {
    if (!session) return;

    const { data, error } = await supabase
      .from("profiles")
      .update(updatedProfile)
      .eq("id", session.user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error updating profile:", error);
      return;
    }
    setProfile(data);
  };

  useEffect(() => {
    if (!session?.user.id) return;

    const channel = supabase.channel("project_room", {
      config: {
        presence: {
          key: session.user.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const onlineUserIds = Object.keys(state);

        if (process.env.NODE_ENV === "development") {
          console.log("Currently Online IDs:", onlineUserIds);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session?.user.id]);

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
    ],
  );

  const handleUsernameSet = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile?.id) return;
    const { data, error } = await supabase
      .from("profiles")
      .update({ username: userName, display_name: displayName })
      .eq("id", profile.id)
      .select()
      .maybeSingle();
    if (error) {
      console.error("Error setting username:", error);
      if (error.code === "23505") {
        setUserNameError("Username already taken. Please choose another.");
      } else {
        setUserNameError(
          "An error occurred while setting the username. Please try again.",
        );
      }
      return;
    }
    if (data) {
      setProfile(data);
    }
  };

  useEffect(() => {
    if (userNameError === null) return;
    const timer = setTimeout(() => {
      setUserNameError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [userNameError]);

  return (
    <AuthContext.Provider value={value}>
      {profile?.id && (
        <Dialog open={profile?.username === null}>
          <DialogContent>
            <form
              onSubmit={handleUsernameSet}
              className=" px-5 gap-5 flex flex-col "
            >
              <DialogTitle className=" text-lg font-bold ">
                Set Username
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                You dont seem to have a username set. Please set your username
                to continue.
              </DialogDescription>
              <FieldGroup>
                <Field>
                  <FieldLabel>Username*</FieldLabel>
                  <FieldError>{userNameError}</FieldError>
                  <FieldError />
                  <Input
                    required
                    type="text"
                    placeholder="Enter your username"
                    value={userName || ""}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Display Name (Optional)</FieldLabel>
                  <FieldError />
                  <Input
                    type="text"
                    placeholder="Enter your display name"
                    value={displayName || ""}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </Field>
              </FieldGroup>
              <Button type="submit" className="w-full">
                Update Profile
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

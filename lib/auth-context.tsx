"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession, signOut as nextAuthSignOut, SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";

export type UserRole = "admin" | "customer";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const isLoading = status === "loading";

  useEffect(() => {
    if (session?.user) {
      setProfile({
        id: (session.user as any).id,
        name: session.user.name || "User",
        email: session.user.email || "",
        role: (session.user as any).role || "customer",
        image: session.user.image || undefined,
      });
    } else {
      setProfile(null);
    }
  }, [session]);

  const signOut = async () => {
    await nextAuthSignOut({ redirect: true, callbackUrl: "/login" });
  };

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
